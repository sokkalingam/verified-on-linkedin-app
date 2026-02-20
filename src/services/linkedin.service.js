const { httpsRequest } = require('../utils/https.util');

async function exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri
  });

  const body = params.toString();

  const options = {
    hostname: 'www.linkedin.com',
    path: '/oauth/v2/accessToken',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const response = await httpsRequest(options, body);
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
