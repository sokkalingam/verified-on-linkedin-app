const querystring = require('querystring');
const crypto = require('crypto');
const { encodeState, decodeState } = require('../utils/session-state.util');
const { exchangeCodeForToken } = require('../services/linkedin.service');
const { getHomePage } = require('../views/home.view');
const { getErrorPage } = require('../views/error.view');
const { logUsage } = require('../services/usage.service');
const { getRedirectUri } = require('../utils/redirect-uri.util');
const { getSession, createSession } = require('../services/session.service');

function handleAuth(req, res) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const params = querystring.parse(body);
        const clientId = params.clientId?.trim();
        const clientSecret = params.clientSecret?.trim();
        const apiTier = params.apiTier?.trim() || 'lite';

        // Validation
        if (!clientId || !clientSecret) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(getHomePage('Both Client ID and Client Secret are required', false, apiTier, getRedirectUri(req)));
          return;
        }

        // Log form submission (non-blocking)
        logUsage(clientId, apiTier, 'form_submission').catch(err =>
          console.error('❌ Failed to log form submission:', err.message)
        );

        // Determine scopes based on API tier
        let scopes;
        let accountSignalsRequested = false;
        if (apiTier === 'plus') {
          scopes = 'r_verify_details r_profile_basicinfo r_most_recent_education r_primary_current_experience r_account_signals';
          accountSignalsRequested = true;
        } else {
          scopes = 'r_verify r_profile_basicinfo';
        }

        const redirectUri = getRedirectUri(req);

        // Encode all session data into the OAuth state parameter.
        // This avoids any server-side session storage and works reliably
        // across Vercel Lambda cold starts and multiple instances.
        const state = encodeState({ clientId, clientSecret, apiTier, scopes, redirectUri, accountSignalsRequested });

        console.log('🎯 API Tier:', apiTier.toUpperCase());
        console.log('🔐 Redirecting to LinkedIn OAuth...');

        const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scopes)}`;

        res.writeHead(302, { 'Location': authUrl });
        res.end();
      } catch (err) {
        console.error('❌ Error in handleAuth:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(getErrorPage('Internal server error'));
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
}

async function handleCallback(req, res, parsedUrl) {
  const code = parsedUrl.query.code;
  const rawState = parsedUrl.query.state;
  const error = parsedUrl.query.error;

  if (error) {
    const credentials = decodeState(rawState);

    // Seamless fallback: if r_account_signals is not enabled for this app, silently retry without it
    if ((error === 'unauthorized_scope_error' || error === 'invalid_scope_error') && credentials && credentials.accountSignalsRequested) {
      console.log('⚠️  r_account_signals not enabled for this app — retrying OAuth without it');

      const reducedScopes = credentials.scopes.replace(/\br_account_signals\b/, '').replace(/\s+/g, ' ').trim();
      const retryState = encodeState({
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        apiTier: credentials.apiTier,
        scopes: reducedScopes,
        redirectUri: credentials.redirectUri,
        accountSignalsRequested: false
      });

      const retryAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&state=${encodeURIComponent(retryState)}&scope=${encodeURIComponent(reducedScopes)}`;
      res.writeHead(302, { 'Location': retryAuthUrl });
      res.end();
      return;
    }

    // All other errors — log and show error page
    if (credentials) {
      logUsage(credentials.clientId, credentials.apiTier, 'oauth_failure').catch(err =>
        console.error('❌ Failed to log oauth_failure:', err.message)
      );
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getErrorPage(error));
    console.error('❌ Authentication error:', error);
    return;
  }

  if (!code) {
    const credentials = decodeState(rawState);
    if (credentials) {
      logUsage(credentials.clientId, credentials.apiTier, 'oauth_failure').catch(err =>
        console.error('❌ Failed to log oauth_failure:', err.message)
      );
    }
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(getErrorPage('No authorization code received'));
    return;
  }

  // Decode credentials from the signed state parameter
  const credentials = decodeState(rawState);

  if (!credentials) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(getErrorPage('Invalid or expired session. Please start again.'));
    return;
  }

  console.log('✅ Authorization code received');

  // Deduplication: Vercel's edge layer occasionally invokes the Lambda twice for
  // the same callback request. The auth code is single-use, so the second invocation
  // always fails with 400. Cache the profile URL after a successful exchange so the
  // second invocation can reuse it rather than failing.
  //
  // Race condition: both invocations could pass this check before either stores the
  // result. This is handled in the catch block — if the second invocation gets a 400,
  // it means the first already succeeded and stored its result, so a cache check there
  // recovers it. The window between "first stores" and "second checks" is milliseconds.
  const codeHash = `code:${crypto.createHash('sha256').update(code).digest('hex')}`;
  const cached = await getSession(codeHash).catch(() => null);
  if (cached) {
    console.log('⚠️ Duplicate callback — reusing cached profile URL');
    res.writeHead(302, { 'Location': cached.profileUrl });
    res.end();
    return;
  }

  try {
    console.log('📡 Exchanging code for access token...');
    const accessToken = await exchangeCodeForToken(code, credentials.clientId, credentials.clientSecret, credentials.redirectUri);
    console.log('✅ Access token obtained');

    // Log OAuth success (non-blocking)
    logUsage(credentials.clientId, credentials.apiTier, 'oauth_success').catch(err =>
      console.error('❌ Failed to log oauth_success:', err.message)
    );

    const profileUrl = `/memberProfile?token=${encodeURIComponent(accessToken)}&clientId=${encodeURIComponent(credentials.clientId)}&scopes=${encodeURIComponent(credentials.scopes)}`;

    // Store before redirecting so the second invocation can recover if it arrives
    // after this point but before its own LinkedIn call returns 400.
    createSession(codeHash, { profileUrl }).catch(() => null);

    res.writeHead(302, { 'Location': profileUrl });
    res.end();

    console.log('🔄 Redirecting to member profile page...');

  } catch (err) {
    console.error('❌ Error:', err.message);

    // A 400 from LinkedIn on the token exchange means the code was already consumed
    // by a parallel invocation. Check the cache — the successful invocation stores its
    // result before responding, so it should be present by the time we reach here.
    if (err.message.startsWith('HTTP 400')) {
      const recovered = await getSession(codeHash).catch(() => null);
      if (recovered) {
        console.log('⚠️ Code consumed by parallel invocation — recovering from cache');
        res.writeHead(302, { 'Location': recovered.profileUrl });
        res.end();
        return;
      }
    }

    logUsage(credentials.clientId, credentials.apiTier, 'oauth_failure').catch(e =>
      console.error('❌ Failed to log oauth_failure:', e.message)
    );

    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(getErrorPage(err.message));
  }
}

module.exports = {
  handleAuth,
  handleCallback
};
