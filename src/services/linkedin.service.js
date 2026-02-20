const { httpsRequest } = require('../utils/https.util');

async function exchangeCodeForToken(code, clientId, clientSecret, redirectUri, codeVerifier) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    ...(codeVerifier && { code_verifier: codeVerifier })
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

  // LinkedIn's auth servers are eventually consistent — a valid token exchange
  // request occasionally returns 400 on first attempt then succeeds on retry.
  // Retry once after a short delay to handle this gracefully within one request.
  try {
    const response = await httpsRequest(options, body);
    return response.access_token;
  } catch (err) {
    if (!err.message.startsWith('HTTP 400')) throw err;
    await new Promise(resolve => setTimeout(resolve, 1500));
    const response = await httpsRequest(options, body);
    return response.access_token;
  }
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
