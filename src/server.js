// Load environment variables from .env.local
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const http = require('http');
const url = require('url');
const { PORT, BASE_URL } = require('./config');
const { handleHome } = require('./routes/home.route');
const { handleAuth, handleCallback } = require('./routes/auth.route');
const { handleMemberProfile } = require('./routes/profile.route');
const { handleDashboard } = require('./routes/dashboard.route');
const { initializeDatabase } = require('./services/usage.service');

// Initialize database connection on startup (runs on each cold start)
initializeDatabase().catch(err => {
  console.error('⚠️  Database initialization failed:', err.message);
});

async function handler(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    if (pathname === '/' || pathname === '/index.html') {
      handleHome(req, res);
    } else if (pathname === '/auth') {
      handleAuth(req, res);
    } else if (pathname === '/callback') {
      await handleCallback(req, res, parsedUrl);
    } else if (pathname === '/memberProfile') {
      await handleMemberProfile(req, res, parsedUrl);
    } else if (pathname === '/dashboard') {
      await handleDashboard(req, res, parsedUrl);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  } catch (error) {
    console.error('❌ Server error:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error: ' + error.message);
  }
}

// Local development only — Vercel invokes the exported handler directly
// and does not support server.listen()
if (!process.env.VERCEL) {
  console.log('=============================================================');
  console.log('LinkedIn Verification Web App');
  console.log('=============================================================\n');
  console.log(`🚀 Server starting on ${BASE_URL}`);
  console.log(`📖 Open ${BASE_URL} in your browser to begin.`);
  console.log(`\n⚠️  Important: The redirect URI is derived from the incoming request URL.\n`);

  const server = http.createServer(handler);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running at ${BASE_URL}/\n`);
  });
}

module.exports = handler;
