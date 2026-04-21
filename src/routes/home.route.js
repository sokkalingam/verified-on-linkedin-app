const url = require('url');
const { getHomePage } = require('../views/home.view');
const { getRedirectUri } = require('../utils/redirect-uri.util');

function handleHome(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const clientId = parsedUrl.query.clientId || '';
  const clientSecret = parsedUrl.query.clientSecret || '';
  const tier = parsedUrl.query.tier || 'lite';
  const redirectUri = getRedirectUri(req);

  // Pre-filled links skip the setup step — the developer sharing the link
  // has already configured the redirect URI in their LinkedIn app
  const skipSetup = parsedUrl.query.skipSetup === 'true' || !!clientId;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getHomePage('', skipSetup, tier, redirectUri, clientId, clientSecret));
}

module.exports = { handleHome };
