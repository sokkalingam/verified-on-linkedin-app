const url = require('url');
const { getHomePage } = require('../views/home.view');

function handleHome(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const skipSetup = parsedUrl.query.skipSetup === 'true';
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getHomePage('', skipSetup));
}

module.exports = { handleHome };
