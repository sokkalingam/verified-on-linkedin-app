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
      'LinkedIn-Version': '202604',
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
      'LinkedIn-Version': '202604',
      'Authorization': `Bearer ${accessToken}`
    }
  };
  
  return await httpsRequest(options);
}

async function getClientCredentialsToken(clientId, clientSecret) {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'r_validation_status',
    client_id: clientId,
    client_secret: clientSecret
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

async function fetchValidationStatus(twoLeggedToken, memberId) {
  const body = JSON.stringify({ validationQueries: [{ id: memberId }] });
  const options = {
    hostname: 'api.linkedin.com',
    path: '/rest/validationStatus?action=retrieve',
    method: 'POST',
    headers: {
      'LinkedIn-Version': '202604',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Authorization': `Bearer ${twoLeggedToken}`
    }
  };
  return await httpsRequest(options, body);
}

module.exports = {
  exchangeCodeForToken,
  fetchVerificationReport,
  fetchProfileInfo,
  getClientCredentialsToken,
  fetchValidationStatus
};
