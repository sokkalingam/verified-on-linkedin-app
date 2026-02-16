const querystring = require('querystring');
const { getDashboardPage, getLoginPage } = require('../views/dashboard.view');
const { getUsageStats } = require('../services/usage.service');

const DASHBOARD_USERNAME = 'tg-fed';
const DASHBOARD_PASSWORD = 'tgfedvoliappdash';

async function handleDashboard(req, res, parsedUrl) {
  if (req.method === 'GET') {
    // Check if user is authenticated via cookie
    const cookies = parseCookies(req.headers.cookie);
    
    if (cookies.dashboardAuth === 'authenticated') {
      // User is authenticated, show dashboard
      try {
        const stats = await getUsageStats();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getDashboardPage(stats));
      } catch (error) {
        console.error('❌ Error fetching stats:', error.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Error loading dashboard</h1><p>' + error.message + '</p>');
      }
    } else {
      // User is not authenticated, show login form
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getLoginPage());
    }
  } else if (req.method === 'POST') {
    // Handle login form submission
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const params = querystring.parse(body);
      const username = params.username?.trim();
      const password = params.password?.trim();
      
      if (username === DASHBOARD_USERNAME && password === DASHBOARD_PASSWORD) {
        // Correct credentials
        res.writeHead(302, {
          'Location': '/dashboard',
          'Set-Cookie': 'dashboardAuth=authenticated; Path=/; HttpOnly; Max-Age=3600'
        });
        res.end();
      } else {
        // Incorrect credentials
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getLoginPage('Invalid username or password'));
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  return cookies;
}

module.exports = {
  handleDashboard
};
