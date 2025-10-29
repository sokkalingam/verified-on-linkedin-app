const { getHomePage } = require('../views/home.view');

function handleHome(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getHomePage());
}

module.exports = { handleHome };
