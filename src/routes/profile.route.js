const { fetchVerificationReport, fetchProfileInfo } = require('../services/linkedin.service');
const { getProfilePage } = require('../views/profile.view');
const { buildTutorialSteps } = require('../views/tutorial.view');
const { getErrorPage } = require('../views/error.view');

async function handleMemberProfile(req, res, parsedUrl) {
  const accessToken = parsedUrl.query.token;
  const clientId = parsedUrl.query.clientId;
  const scopes = parsedUrl.query.scopes || 'r_verify r_profile_basicinfo';
  
  if (!accessToken) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(getErrorPage('No access token provided'));
    return;
  }
  
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
    
    // Build tutorial data
    const tutorialHTML = buildTutorialSteps(accessToken, clientId, scopes);
    
    // Display profile page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getProfilePage(profileInfo, verificationReport, tutorialHTML));
    
    console.log('\n✅ Verification complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(getErrorPage(error.message));
  }
}

module.exports = { handleMemberProfile };
