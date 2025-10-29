const { httpsRequest } = require('../utils/https.util');
const { REDIRECT_URI } = require('../config');

async function exchangeCodeForToken(code, clientId, clientSecret) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI
  });
  
  const options = {
    hostname: 'www.linkedin.com',
    path: '/oauth/v2/accessToken',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': params.toString().length
    }
  };
  
  const response = await httpsRequest(options, params.toString());
  return response.access_token;
}

async function fetchVerificationReport(accessToken) {
  const options = {
    hostname: 'api.linkedin.com',
    path: '/rest/verificationReport',
    method: 'GET',
    headers: {
      'LinkedIn-Version': '202510',
      'Authorization': `Bearer ${accessToken}`
    }
  };
  
  return await httpsRequest(options);
}

async function fetchProfileInfo(accessToken) {
  const options = {
    hostname: 'api.linkedin.com',
    path: '/rest/identityMe',
    method: 'GET',
    headers: {
      'LinkedIn-Version': '202510.03',
      'Authorization': `Bearer ${accessToken}`
    }
  };
  
  return await httpsRequest(options);
}

module.exports = {
  exchangeCodeForToken,
  fetchVerificationReport,
  fetchProfileInfo
};
