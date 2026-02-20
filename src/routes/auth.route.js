const querystring = require('querystring');
const { encodeState, decodeState } = require('../utils/session-state.util');
const { exchangeCodeForToken } = require('../services/linkedin.service');
const { getHomePage } = require('../views/home.view');
const { getErrorPage } = require('../views/error.view');
const { logUsage } = require('../services/usage.service');
const { getRedirectUri } = require('../utils/redirect-uri.util');

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
        if (apiTier === 'plus') {
          scopes = 'r_verify_details r_profile_basicinfo r_most_recent_education r_primary_current_experience';
        } else {
          scopes = 'r_verify r_profile_basicinfo';
        }

        const redirectUri = getRedirectUri(req);

        // Encode all session data into the OAuth state parameter.
        // This avoids any server-side session storage and works reliably
        // across Vercel Lambda cold starts and multiple instances.
        const state = encodeState({ clientId, clientSecret, apiTier, scopes, redirectUri });

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

  try {
    console.log('📡 Exchanging code for access token...');
    const accessToken = await exchangeCodeForToken(code, credentials.clientId, credentials.clientSecret, credentials.redirectUri);
    console.log('✅ Access token obtained');

    // Log OAuth success (non-blocking)
    logUsage(credentials.clientId, credentials.apiTier, 'oauth_success').catch(err =>
      console.error('❌ Failed to log oauth_success:', err.message)
    );

    res.writeHead(302, {
      'Location': `/memberProfile?token=${encodeURIComponent(accessToken)}&clientId=${encodeURIComponent(credentials.clientId)}&scopes=${encodeURIComponent(credentials.scopes)}`
    });
    res.end();

    console.log('🔄 Redirecting to member profile page...');

  } catch (err) {
    console.error('❌ Error:', err.message);

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
