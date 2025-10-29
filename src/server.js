const http = require('http');
const url = require('url');
const { PORT, BASE_URL, REDIRECT_URI } = require('./config');
const { handleHome } = require('./routes/home.route');
const { handleAuth, handleCallback } = require('./routes/auth.route');
const { handleMemberProfile } = require('./routes/profile.route');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Home page
    if (pathname === '/' || pathname === '/index.html') {
      handleHome(req, res);
    }
    
    // OAuth redirect endpoint
    else if (pathname === '/auth') {
      handleAuth(req, res);
    }
    
    // Callback handler
    else if (pathname === '/callback') {
      await handleCallback(req, res, parsedUrl);
    }
    
    // Member Profile page - makes fresh API calls on each load
    else if (pathname === '/memberProfile') {
      await handleMemberProfile(req, res, parsedUrl);
    }
    
    // 404
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  } catch (error) {
    console.error('❌ Server error:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error: ' + error.message);
  }
});

console.log('=============================================================');
console.log('LinkedIn Verification Web App');
console.log('=============================================================\n');
console.log(`🚀 Server starting on ${BASE_URL}`);
console.log(`📖 Open ${BASE_URL} in your browser to begin.`);
console.log(`\n⚠️  Important: Update your LinkedIn app's redirect URI to:`);
console.log(`   ${REDIRECT_URI}\n`);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at ${BASE_URL}/\n`);
});
