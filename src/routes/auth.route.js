const querystring = require('querystring');
const { REDIRECT_URI } = require('../config');
const { createSession, getSession, deleteSession } = require('../services/session.service');
const { exchangeCodeForToken } = require('../services/linkedin.service');
const { getHomePage } = require('../views/home.view');
const { getErrorPage } = require('../views/error.view');
const { logUsage } = require('../services/usage.service');

function handleAuth(req, res) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const params = querystring.parse(body);
      const clientId = params.clientId?.trim();
      const clientSecret = params.clientSecret?.trim();
      const apiTier = params.apiTier?.trim() || 'lite';
      
      // Validation
      if (!clientId || !clientSecret) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getHomePage('Both Client ID and Client Secret are required'));
        return;
      }
      
      // Log form submission (non-blocking)
      logUsage(clientId, apiTier, 'form_submission').catch(err => 
        console.error('❌ Failed to log form submission:', err.message)
      );
      
      // Determine scopes based on API tier
      // Development and Lite use the same scopes
      let scopes;
      if (apiTier === 'plus') {
        scopes = 'r_verify_details r_profile_basicinfo r_most_recent_education r_primary_current_experience';
      } else {
        // Default for 'development', 'lite', or any other value
        scopes = 'r_verify r_profile_basicinfo';
      }
      
      // Generate a session ID to store credentials temporarily
      const sessionId = Math.random().toString(36).substring(7);
      createSession(sessionId, { clientId, clientSecret, apiTier, scopes });
      
      console.log('🔐 Using Client ID:', clientId);
      console.log('🎯 API Tier:', apiTier.toUpperCase());
      console.log('🔐 Redirecting to LinkedIn OAuth...');
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${sessionId}&scope=${encodeURIComponent(scopes)}`;
      
      console.log('\n📍 FULL OAUTH URL:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(authUrl);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📋 URL Parameters:');
      console.log('   • response_type: code');
      console.log('   • client_id:', clientId);
      console.log('   • redirect_uri:', REDIRECT_URI);
      console.log('   • scope:', scopes);
      console.log('   • state:', sessionId + '\n');
      
      res.writeHead(302, { 'Location': authUrl });
      res.end();
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
}

async function handleCallback(req, res, parsedUrl) {
  const code = parsedUrl.query.code;
  const sessionId = parsedUrl.query.state;
  const error = parsedUrl.query.error;
  
  if (error) {
    // Retrieve credentials from session to log the failure
    const credentials = getSession(sessionId);
    if (credentials) {
      logUsage(credentials.clientId, credentials.apiTier, 'oauth_failure').catch(err => 
        console.error('❌ Failed to log oauth_failure:', err.message)
      );
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getErrorPage(error));
    console.error('❌ Authentication error:', error);
    return;
  }
  
  if (!code) {
    // Retrieve credentials from session to log the failure
    const credentials = getSession(sessionId);
    if (credentials) {
      logUsage(credentials.clientId, credentials.apiTier, 'oauth_failure').catch(err => 
        console.error('❌ Failed to log oauth_failure:', err.message)
      );
    }
    
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(getErrorPage('No authorization code received'));
    return;
  }
  
  // Retrieve credentials from session
  const credentials = getSession(sessionId);
  
  if (!credentials) {
    // We can't log the failure without credentials, but we can still handle the error
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(getErrorPage('Session expired or invalid. Please start again.'));
    return;
  }
  
  console.log('✅ Authorization code received');
  
  try {
    // Exchange code for access token
    console.log('📡 Exchanging code for access token...');
    const accessToken = await exchangeCodeForToken(code, credentials.clientId, credentials.clientSecret);
    console.log('✅ Access token obtained');
    
    // Log OAuth success (non-blocking)
    logUsage(credentials.clientId, credentials.apiTier, 'oauth_success').catch(err => 
      console.error('❌ Failed to log oauth_success:', err.message)
    );
    
    // Redirect to member profile with access token, client ID, and scopes for tutorial
    res.writeHead(302, { 
      'Location': `/memberProfile?token=${encodeURIComponent(accessToken)}&clientId=${encodeURIComponent(credentials.clientId)}&scopes=${encodeURIComponent(credentials.scopes)}`
    });
    res.end();
    
    // Clean up session
    deleteSession(sessionId);
    
    console.log('🔄 Redirecting to member profile page...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Log OAuth failure (non-blocking)
    logUsage(credentials.clientId, credentials.apiTier, 'oauth_failure').catch(err => 
      console.error('❌ Failed to log oauth_failure:', err.message)
    );
    
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(getErrorPage(error.message));
  }
}

module.exports = {
  handleAuth,
  handleCallback
};
