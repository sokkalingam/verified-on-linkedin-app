const { getClientCredentialsToken, fetchValidationStatus } = require('../services/linkedin.service');

async function handleRefreshValidationStatus(req, res, parsedUrl) {
  const clientId = parsedUrl.query.clientId;
  const clientSecret = parsedUrl.query.clientSecret;
  const memberId = parsedUrl.query.memberId;

  if (!clientId || !clientSecret || !memberId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Missing required parameters: clientId, clientSecret, memberId' }));
    return;
  }

  try {
    console.log(`📡 Refreshing validation status for member ${memberId}...`);
    // Always generate a fresh 2-legged token — client credentials tokens are short-lived
    // (typically 30 minutes) so we don't cache them.
    const twoLeggedToken = await getClientCredentialsToken(clientId, clientSecret);
    console.log('✅ 2-legged access token obtained');
    const data = await fetchValidationStatus(twoLeggedToken, memberId);
    console.log('✅ Validation status fetched');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data }));
  } catch (error) {
    console.warn(`⚠️  Validation status refresh failed: ${error.message}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
}

module.exports = { handleRefreshValidationStatus };
