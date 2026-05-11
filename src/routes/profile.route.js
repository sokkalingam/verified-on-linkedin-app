const crypto = require('crypto');
const { fetchVerificationReport, fetchProfileInfo, getClientCredentialsToken, fetchValidationStatus } = require('../services/linkedin.service');
const { getProfilePage } = require('../views/profile.view');
const { buildTutorialSteps } = require('../views/tutorial.view');
const { getErrorPage } = require('../views/error.view');
const { logUsage } = require('../services/usage.service');
const { getSession } = require('../services/session.service');

async function handleMemberProfile(req, res, parsedUrl) {
  const accessToken = parsedUrl.query.token;

  if (!accessToken) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(getErrorPage('No access token provided'));
    return;
  }

  // The auth callback stashed clientId/clientSecret/scopes server-side keyed by
  // sha256(accessToken). Look them up here so the URL only carries the token.
  const credsKey = `creds:${crypto.createHash('sha256').update(accessToken).digest('hex')}`;
  const storedCreds = await getSession(credsKey).catch(() => null);
  const clientId = storedCreds?.clientId || '';
  const clientSecret = storedCreds?.clientSecret || '';
  const scopes = storedCreds?.scopes || 'r_verify r_profile_basicinfo';
  
  try {
    // Fetch verification report
    console.log('📡 Fetching verification report...');
    console.log('\n💡 You can also run this curl command:');
    console.log(`curl -X GET 'https://api.linkedin.com/rest/verificationReport' \\`);
    console.log(`  -H 'LinkedIn-Version: 202510' \\`);
    console.log(`  -H 'Authorization: Bearer ${accessToken}'`);
    console.log('');
    
    const verificationReport = await fetchVerificationReport(accessToken);
    console.log('✅ Verification report received');
    
    // Fetch profile information
    console.log('\n📡 Fetching profile information...');
    console.log('\n💡 You can also run this curl command:');
    console.log(`curl -X GET 'https://api.linkedin.com/rest/identityMe' \\`);
    console.log(`  -H 'LinkedIn-Version: 202510.03' \\`);
    console.log(`  -H 'Authorization: Bearer ${accessToken}'`);
    console.log('');
    
    const profileInfo = await fetchProfileInfo(accessToken);
    console.log('✅ Profile information received');

    // Fetch validation status using a 2-legged OAuth token (client credentials).
    // This is a separate token from the user's access token and requires the
    // r_validation_status scope to be enabled on the LinkedIn app.
    // Failures are non-fatal — the page still renders without this section.
    let validationStatus = null;
    let twoLeggedToken = null;
    const memberId = profileInfo.id;
    if (memberId && clientSecret) {
      try {
        console.log('\n📡 Fetching 2-legged access token...');
        twoLeggedToken = await getClientCredentialsToken(clientId, clientSecret);
        console.log('✅ 2-legged access token obtained');
      } catch (tokenError) {
        console.warn(`⚠️ 2-legged token unavailable: ${tokenError.message}`);
        validationStatus = { error: tokenError.message };
      }

      if (twoLeggedToken) {
        try {
          console.log('\n📡 Fetching validation status...');
          validationStatus = await fetchValidationStatus(twoLeggedToken, memberId);
          console.log('✅ Validation status received');
        } catch (validationError) {
          console.warn(`⚠️ Validation status unavailable: ${validationError.message}`);
          validationStatus = { error: validationError.message };
        }
      }
    }

    // Build tutorial data — pass memberId and the 2-legged token so the step-6 curl
    // shows the real bearer instead of the TWO_LEGGED_TOKEN placeholder.
    const tutorialHTML = buildTutorialSteps(accessToken, clientId, scopes, memberId, twoLeggedToken);

    // Display profile page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getProfilePage(profileInfo, verificationReport, tutorialHTML, validationStatus, clientId, clientSecret));
    
    // Log successful API call - get tier from scopes (if available, default to 'lite')
    const tier = scopes.includes('r_account_signals') ? 'plus_signals' : scopes.includes('r_verify_details') ? 'plus' : 'lite';
    logUsage(clientId, tier, 'api_success').catch(err => 
      console.error('❌ Failed to log api_success:', err.message)
    );
    
    console.log('\n✅ Verification complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Log failed API call - get tier from scopes (if available, default to 'lite')
    const tier = scopes.includes('r_account_signals') ? 'plus_signals' : scopes.includes('r_verify_details') ? 'plus' : 'lite';
    logUsage(clientId, tier, 'api_failure').catch(err => 
      console.error('❌ Failed to log api_failure:', err.message)
    );
    
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(getErrorPage(error.message));
  }
}

module.exports = { handleMemberProfile };
