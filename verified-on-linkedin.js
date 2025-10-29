const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

const PORT = 5000;
const BASE_URL = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : `http://localhost:${PORT}`;
const REDIRECT_URI = `${BASE_URL}/callback`;

// Store credentials temporarily (in production, use sessions or secure storage)
let sessionStore = {};

function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', (error) => { reject(error); });
    if (postData) { req.write(postData); }
    req.end();
  });
}

function getHomePage(errorMessage = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Verification</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      padding: 60px 40px;
      text-align: center;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: #0A66C2;
      border-radius: 16px;
      margin: 0 auto 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: white;
    }
    h1 {
      font-size: 32px;
      color: #1a1a1a;
      margin-bottom: 16px;
      font-weight: 700;
    }
    p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 40px;
    }
    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 600;
      border-left: 4px solid #c62828;
    }
    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }
    label {
      display: block;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
      font-size: 14px;
    }
    label .required {
      color: #c62828;
    }
    input[type="text"], input[type="password"], select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      font-family: monospace;
    }
    input[type="text"]:focus, input[type="password"]:focus, select:focus {
      outline: none;
      border-color: #0A66C2;
    }
    select {
      cursor: pointer;
      background-color: white;
    }
    .btn {
      background: #0A66C2;
      color: white;
      border: none;
      padding: 16px 48px;
      font-size: 18px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(10, 102, 194, 0.3);
    }
    .btn:hover {
      background: #004182;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(10, 102, 194, 0.4);
    }
    .features {
      margin-top: 40px;
      text-align: left;
    }
    .feature {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      color: #666;
    }
    .feature-icon {
      width: 24px;
      height: 24px;
      background: #e8f5e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: 14px;
    }
    .helper-text {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    .setup-section {
      background: #e3f2fd;
      border: 2px solid #0A66C2;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: left;
    }
    .setup-title {
      font-size: 16px;
      font-weight: 600;
      color: #0A66C2;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .setup-step {
      font-size: 14px;
      color: #333;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .redirect-uri {
      background: white;
      border: 1px solid #90caf9;
      border-radius: 6px;
      padding: 12px;
      font-family: monospace;
      font-size: 13px;
      color: #0A66C2;
      word-break: break-all;
      margin: 8px 0;
      font-weight: 600;
    }
    .setup-link {
      color: #0A66C2;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    .setup-link:hover {
      text-decoration: underline;
    }
    .checkbox-container {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .checkbox-container:hover {
      background: #f5f5f5;
    }
    .checkbox-container input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .checkbox-label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
    }
    .step2-container {
      opacity: 0.4;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .step2-container.enabled {
      opacity: 1;
      pointer-events: auto;
    }
    .step2-disabled-message {
      background: #ffe5e5;
      border: 1px solid #ffcccc;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
      color: #c62828;
      font-size: 14px;
      text-align: center;
      display: block;
    }
    .step2-disabled-message.hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🔐</div>
    <h1>LinkedIn Verification</h1>
    <p>Verify your LinkedIn identity and access your profile information securely</p>
    
    ${errorMessage ? `<div class="error-message">⚠️ ${errorMessage}</div>` : ''}
    
    <div class="setup-section">
      <div class="setup-title">
        <span>⚙️</span>
        <span>Step 1: Configure Your LinkedIn App</span>
      </div>
      <div class="setup-step">
        Before entering your credentials, add this redirect URI to your LinkedIn app settings:
      </div>
      <div class="redirect-uri">${REDIRECT_URI}</div>
      <div class="setup-step">
        📍 <strong>How to add it:</strong>
        <br>1. Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" class="setup-link">LinkedIn Developer Portal</a>
        <br>2. Select your app → <strong>Auth</strong> tab
        <br>3. Under "OAuth 2.0 settings", click <strong>Add redirect URL</strong>
        <br>4. Paste the URL above and save
      </div>
      
      <div class="checkbox-container" onclick="document.getElementById('setupComplete').click()">
        <input type="checkbox" id="setupComplete" onclick="event.stopPropagation(); toggleStep2()" />
        <label for="setupComplete" class="checkbox-label" onclick="event.stopPropagation()">
          I have added the redirect URI to my LinkedIn app
        </label>
      </div>
    </div>
    
    <div id="step2DisabledMessage" class="step2-disabled-message">
      ⚠️ Please complete Step 1 above before entering your credentials
    </div>
    
    <div id="step2Container" class="step2-container">
      <div class="setup-title" style="margin-bottom: 20px;">
        <span>🔑</span>
        <span>Step 2: Enter Your Credentials</span>
      </div>
    
      <form action="/auth" method="POST" id="authForm">
        <div class="form-group">
          <label for="clientId">LinkedIn Client ID <span class="required">*</span></label>
          <input type="text" id="clientId" name="clientId" required placeholder="Enter your LinkedIn Client ID" disabled>
          <div class="helper-text">From your LinkedIn app dashboard</div>
        </div>
        
        <div class="form-group">
          <label for="clientSecret">LinkedIn Client Secret <span class="required">*</span></label>
          <input type="password" id="clientSecret" name="clientSecret" required placeholder="Enter your LinkedIn Client Secret" disabled>
          <div class="helper-text">Keep this confidential</div>
        </div>
        
        <div class="form-group">
          <label for="apiTier">Verified On LinkedIn API Product Tier <span class="required">*</span></label>
          <select id="apiTier" name="apiTier" required disabled>
            <option value="development" selected>Development</option>
            <option value="lite">Lite</option>
            <option value="plus">Plus</option>
          </select>
          <div class="helper-text">Select your LinkedIn API product tier</div>
        </div>
        
        <button type="submit" class="btn" disabled>Verify on LinkedIn</button>
      </form>
    </div>
    
    <div class="features">
      <div class="feature">
        <div class="feature-icon">✓</div>
        <span>Secure OAuth 2.0 Authentication</span>
      </div>
      <div class="feature">
        <div class="feature-icon">✓</div>
        <span>Identity Verification</span>
      </div>
      <div class="feature">
        <div class="feature-icon">✓</div>
        <span>Profile Information Access</span>
      </div>
    </div>
  </div>
  
  <script>
    function toggleStep2() {
      const checkbox = document.getElementById('setupComplete');
      const step2Container = document.getElementById('step2Container');
      const disabledMessage = document.getElementById('step2DisabledMessage');
      const clientId = document.getElementById('clientId');
      const clientSecret = document.getElementById('clientSecret');
      const apiTier = document.getElementById('apiTier');
      const submitBtn = document.querySelector('.btn');
      
      if (checkbox.checked) {
        step2Container.classList.add('enabled');
        disabledMessage.classList.add('hidden');
        clientId.disabled = false;
        clientSecret.disabled = false;
        apiTier.disabled = false;
        submitBtn.disabled = false;
      } else {
        step2Container.classList.remove('enabled');
        disabledMessage.classList.remove('hidden');
        clientId.disabled = true;
        clientSecret.disabled = true;
        apiTier.disabled = true;
        submitBtn.disabled = true;
      }
    }
  </script>
</body>
</html>`;
}

function buildTutorialSteps(accessToken, clientId, scopes) {
  const maskedToken = accessToken ? `${accessToken.substring(0, 20)}...` : 'YOUR_ACCESS_TOKEN';
  const scopeList = scopes || 'r_verify r_profile_basicinfo';
  
  return `
    <!-- Step 1: OAuth Authorization -->
    <div class="flow-step">
      <div class="step-number complete">1</div>
      <div class="step-content">
        <h3 class="step-title">OAuth Authorization</h3>
        <div class="step-description">
          <ol style="margin: 0; padding-left: 20px;">
            <li>User is redirected to LinkedIn's authorization page</li>
            <li>User logs in and grants permissions</li>
            <li>LinkedIn redirects back with an authorization code</li>
          </ol>
        </div>
        
        <div class="step-details">
          <div class="detail-header" onclick="toggleDetail(this)">
            <span class="detail-header-title">
              <span>📖</span> View Request Details
            </span>
            <span class="detail-chevron">▼</span>
          </div>
          <div class="detail-content">
            <div class="detail-section">
              <div class="detail-label">HTTP Request</div>
              <div class="code-block"><span class="http-method http-get">GET</span>https://www.linkedin.com/oauth/v2/authorization</div>
              
              <div class="detail-label">Query Parameters</div>
              <div class="code-block"><span class="code-key">response_type</span>: <span class="code-string">"code"</span>
<span class="code-key">client_id</span>: <span class="code-string">"${clientId || 'YOUR_CLIENT_ID'}"</span>
<span class="code-key">redirect_uri</span>: <span class="code-string">"REDIRECT_URL"</span>
<span class="code-key">state</span>: <span class="code-string">"A unique hard-to-guess value for CSRF protection (e.g., DCEeFWf45A53sdfKef424)"</span>
<span class="code-key">scope</span>: <span class="code-string">"${scopeList}"</span></div>

              <div class="detail-label">Complete Authorization URL</div>
              <div class="code-block">https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=<span class="code-string">${clientId || 'YOUR_CLIENT_ID'}</span>&redirect_uri=<span class="code-string">REDIRECT_URL</span>&state=<span class="code-string">DCEeFWf45A53sdfKef424</span>&scope=<span class="code-string">${encodeURIComponent(scopeList)}</span></div>

              <div class="detail-label">What Happens</div>
              <div class="code-block"><span class="code-comment">// 1. User clicks "Verify on LinkedIn"
// 2. Browser redirects to the URL above
// 3. User logs in to LinkedIn and grants permissions
// 4. LinkedIn redirects back to your callback URL with:
//    - code: authorization code (single-use, expires in 30 minutes)
//    - state: the same state you sent (for CSRF protection)</span></div>

              <div class="detail-label">Example Callback URL</div>
              <div class="code-block">REDIRECT_URL?code=<span class="code-string">AQTyJHbZxyz...</span>&state=<span class="code-string">abc123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Token Exchange -->
    <div class="flow-step">
      <div class="step-number complete">2</div>
      <div class="step-content">
        <h3 class="step-title">Token Exchange</h3>
        <div class="step-description">
          <ol style="margin: 0; padding-left: 20px;">
            <li>Server receives authorization code from callback</li>
            <li>Exchange code for access token via POST request</li>
            <li>Keep client secret secure (server-side only)</li>
          </ol>
        </div>
        
        <div class="step-details">
          <div class="detail-header" onclick="toggleDetail(this)">
            <span class="detail-header-title">
              <span>📖</span> View Request Details
            </span>
            <span class="detail-chevron">▼</span>
          </div>
          <div class="detail-content">
            <div class="detail-section">
              <div class="detail-label">HTTP Request</div>
              <div class="code-block"><span class="http-method http-post">POST</span>https://www.linkedin.com/oauth/v2/accessToken</div>
              
              <div class="detail-label">Headers</div>
              <div class="code-block"><span class="code-key">Content-Type</span>: <span class="code-string">"application/x-www-form-urlencoded"</span></div>
              
              <div class="detail-label">Request Body</div>
              <div class="code-block"><span class="code-key">grant_type</span>=<span class="code-string">authorization_code</span>
<span class="code-key">code</span>=<span class="code-string">AUTHORIZATION_CODE_FROM_CALLBACK</span>
<span class="code-key">client_id</span>=<span class="code-string">${clientId || 'YOUR_CLIENT_ID'}</span>
<span class="code-key">client_secret</span>=<span class="code-string">YOUR_CLIENT_SECRET</span>
<span class="code-key">redirect_uri</span>=<span class="code-string">REDIRECT_URL</span></div>

              <div class="step-details" style="margin-top: 16px;">
                <div class="detail-header" onclick="toggleDetail(this)">
                  <span class="detail-header-title">
                    <span>📋</span> cURL Template
                  </span>
                  <span class="detail-chevron">▼</span>
                </div>
                <div class="detail-content">
                  <div class="code-block">curl -X POST 'https://www.linkedin.com/oauth/v2/accessToken' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=authorization_code' \\
  -d 'code=AUTHORIZATION_CODE_FROM_CALLBACK' \\
  -d 'client_id=CLIENT_ID' \\
  -d 'client_secret=CLIENT_SECRET' \\
  -d 'redirect_uri=REDIRECT_URI'</div>
                </div>
              </div>

              <div class="step-details" style="margin-top: 8px;">
                <div class="detail-header" onclick="toggleDetail(this)">
                  <span class="detail-header-title">
                    <span>🔑</span> Your cURL Command
                  </span>
                  <span class="detail-chevron">▼</span>
                </div>
                <div class="detail-content">
                  <div class="code-block">curl -X POST 'https://www.linkedin.com/oauth/v2/accessToken' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=authorization_code' \\
  -d 'code=AUTHORIZATION_CODE_FROM_CALLBACK' \\
  -d 'client_id=${clientId || 'YOUR_CLIENT_ID'}' \\
  -d 'client_secret=YOUR_CLIENT_SECRET' \\
  -d 'redirect_uri=REDIRECT_URL'</div>
                  <div style="margin-top: 12px; padding: 8px; background: #fff3cd; border-left: 4px solid #ffc107; font-size: 12px; color: #856404; line-height: 1.6;">
                    <strong>⚠️ Security Note:</strong> Never expose your Client Secret in browser code or URLs. Replace YOUR_CLIENT_SECRET with your actual secret only when running this command server-side or in a secure terminal.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Fetch Verification Report -->
    <div class="flow-step">
      <div class="step-number complete">3</div>
      <div class="step-content">
        <h3 class="step-title">Fetch Verification Report</h3>
        <div class="step-description">
          <ol style="margin: 0; padding-left: 20px;">
            <li>Use access token to authenticate API request</li>
            <li>Fetch user's verification status</li>
            <li>Returns completed verifications (IDENTITY, WORKPLACE, etc.)</li>
          </ol>
        </div>
        
        <div class="step-details">
          <div class="detail-header" onclick="toggleDetail(this)">
            <span class="detail-header-title">
              <span>📖</span> View Request Details
            </span>
            <span class="detail-chevron">▼</span>
          </div>
          <div class="detail-content">
            <div class="detail-section">
              <div class="detail-label">HTTP Request</div>
              <div class="code-block"><span class="http-method http-get">GET</span>https://api.linkedin.com/rest/verificationReport</div>
              
              <div class="detail-label">Headers</div>
              <div class="code-block"><span class="code-key">LinkedIn-Version</span>: <span class="code-string">"202510"</span>
<span class="code-key">Authorization</span>: <span class="code-string">"Bearer ${maskedToken}"</span></div>

              <div class="step-details" style="margin-top: 16px;">
                <div class="detail-header" onclick="toggleDetail(this)">
                  <span class="detail-header-title">
                    <span>📋</span> cURL Template
                  </span>
                  <span class="detail-chevron">▼</span>
                </div>
                <div class="detail-content">
                  <div class="code-block">curl -X GET 'https://api.linkedin.com/rest/verificationReport' \\
  -H 'LinkedIn-Version: 202510' \\
  -H 'Authorization: Bearer ACCESS_TOKEN'</div>
                </div>
              </div>

              <div class="step-details" style="margin-top: 8px;">
                <div class="detail-header" onclick="toggleDetail(this)">
                  <span class="detail-header-title">
                    <span>🔑</span> Your cURL Command
                  </span>
                  <span class="detail-chevron">▼</span>
                </div>
                <div class="detail-content">
                  <div class="code-block">curl -X GET 'https://api.linkedin.com/rest/verificationReport' \\
  -H 'LinkedIn-Version: 202510' \\
  -H 'Authorization: Bearer ${accessToken || 'YOUR_ACCESS_TOKEN'}'</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Fetch Identity Information -->
    <div class="flow-step">
      <div class="step-number complete">4</div>
      <div class="step-content">
        <h3 class="step-title">Fetch Identity Information</h3>
        <div class="step-description">
          <ol style="margin: 0; padding-left: 20px;">
            <li>Use access token to fetch user profile data</li>
            <li>Retrieves name, email, profile picture, and profile URL</li>
            <li>Display information to user</li>
          </ol>
        </div>
        
        <div class="step-details">
          <div class="detail-header" onclick="toggleDetail(this)">
            <span class="detail-header-title">
              <span>📖</span> View Request Details
            </span>
            <span class="detail-chevron">▼</span>
          </div>
          <div class="detail-content">
            <div class="detail-section">
              <div class="detail-label">HTTP Request</div>
              <div class="code-block"><span class="http-method http-get">GET</span>https://api.linkedin.com/rest/identityMe</div>
              
              <div class="detail-label">Headers</div>
              <div class="code-block"><span class="code-key">LinkedIn-Version</span>: <span class="code-string">"202510.03"</span>
<span class="code-key">Authorization</span>: <span class="code-string">"Bearer ${maskedToken}"</span></div>

              <div class="step-details" style="margin-top: 16px;">
                <div class="detail-header" onclick="toggleDetail(this)">
                  <span class="detail-header-title">
                    <span>📋</span> cURL Template
                  </span>
                  <span class="detail-chevron">▼</span>
                </div>
                <div class="detail-content">
                  <div class="code-block">curl -X GET 'https://api.linkedin.com/rest/identityMe' \\
  -H 'LinkedIn-Version: 202510.03' \\
  -H 'Authorization: Bearer ACCESS_TOKEN'</div>
                </div>
              </div>

              <div class="step-details" style="margin-top: 8px;">
                <div class="detail-header" onclick="toggleDetail(this)">
                  <span class="detail-header-title">
                    <span>🔑</span> Your cURL Command
                  </span>
                  <span class="detail-chevron">▼</span>
                </div>
                <div class="detail-content">
                  <div class="code-block">curl -X GET 'https://api.linkedin.com/rest/identityMe' \\
  -H 'LinkedIn-Version: 202510.03' \\
  -H 'Authorization: Bearer ${accessToken || 'YOUR_ACCESS_TOKEN'}'</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Developer Tips Section -->
    <div class="flow-step" style="background: white; border: none; margin-top: 32px; padding-top: 24px; border-top: 2px solid #e0e0e0;">
      <div class="step-content">
        <h3 class="step-title" style="color: #666; font-size: 18px; margin-bottom: 20px;">💡 Configuration & Troubleshooting</h3>
        
        <div class="step-details">
          <div class="detail-header" onclick="toggleDetail(this)">
            <span class="detail-header-title">
              <span>⚙️</span> LinkedIn App Configuration Required
            </span>
            <span class="detail-chevron">▼</span>
          </div>
          <div class="detail-content">
            <div class="detail-section">
              <div class="detail-label">1. Configure Redirect URI</div>
              <div class="code-block"><span class="code-comment">// Add this exact URL to your LinkedIn app settings:</span>
<span class="code-key">Redirect URI:</span> REDIRECT_URL

<span class="code-comment">// Go to: LinkedIn Developer Portal → Your App → Auth tab → OAuth 2.0 settings
// Click "Add redirect URL" and paste the URL above exactly as shown</span></div>

              <div class="detail-label">2. Request Required Scopes</div>
              <div class="code-block"><span class="code-comment">// Make sure your LinkedIn app has access to these scopes:</span>
<span class="code-key">r_profile_basicinfo</span> - Read basic profile information
<span class="code-key">r_verify</span> - Access verification report

<span class="code-comment">// Some scopes require special approval from LinkedIn
// Go to: LinkedIn Developer Portal → Your App → Products tab</span></div>

              <div class="detail-label">3. LinkedIn Developer Portal Links</div>
              <div class="code-block"><span class="code-comment">// Useful links for setting up your app:</span>
Developer Portal: <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" style="color: #0A66C2; text-decoration: underline;">https://www.linkedin.com/developers/apps</a>
OAuth Documentation: <a href="https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow" target="_blank" rel="noopener noreferrer" style="color: #0A66C2; text-decoration: underline;">Microsoft Learn - Authorization Code Flow</a>
API Reference: <a href="https://learn.microsoft.com/en-us/linkedin/consumer/integrations/verified-on-linkedin/overview" target="_blank" rel="noopener noreferrer" style="color: #0A66C2; text-decoration: underline;">Verified on LinkedIn Integration Overview</a></div>
            </div>
          </div>
        </div>

        <div class="step-details">
          <div class="detail-header" onclick="toggleDetail(this)">
            <span class="detail-header-title">
              <span>⚠️</span> Common Issues & Troubleshooting
            </span>
            <span class="detail-chevron">▼</span>
          </div>
          <div class="detail-content">
            <div class="detail-section">
              <div class="detail-label">Error: "redirect_uri_mismatch"</div>
              <div class="code-block"><span class="code-comment">// Cause: Redirect URI doesn't match what's configured in your app
// Solution: 
// 1. Copy the exact redirect URI from above
// 2. Add it to LinkedIn Developer Portal → Auth tab → Redirect URLs
// 3. Make sure it matches EXACTLY</span></div>

              <div class="detail-label">Error: "invalid_client"</div>
              <div class="code-block"><span class="code-comment">// Cause: Wrong Client ID or Client Secret
// Solution:
// 1. Double-check your credentials from LinkedIn Developer Portal → Auth tab
// 2. Make sure you copied the actual secret (not the masked *** version)
// 3. Ensure Content-Type header is 'application/x-www-form-urlencoded'</span></div>

              <div class="detail-label">Error: "unauthorized_scope_error"</div>
              <div class="code-block"><span class="code-comment">// Cause: Your app doesn't have permission to use requested scopes
// Solution:
// 1. Go to LinkedIn Developer Portal → Your App → Products tab
// 2. Request access to required Products (Verified on LinkedIn)
// 3. Wait for LinkedIn approval</span></div>
              
              <div style="margin-top: 12px; padding: 12px; background: #fff3cd; border-left: 4px solid #ffc107; font-size: 13px; color: #856404; line-height: 1.6;">
                <strong>⚠️ API Access Error:</strong> Your LinkedIn developer application either:<br>
                1. Lacks the 'Verified on LinkedIn' API product assignment, or<br>
                2. Is requesting a different tier than provisioned
              </div>

              <div class="detail-label">Authorization Code Expired</div>
              <div class="code-block"><span class="code-comment">// Authorization codes expire in 30 minutes
// Make sure to exchange the code for a token immediately after receiving it</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

function getProfilePage(profileInfo, verificationReport, tutorialData) {
  const firstName = profileInfo.basicInfo?.firstName?.localized?.en_US || 'User';
  const lastName = profileInfo.basicInfo?.lastName?.localized?.en_US || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profileInfo.basicInfo?.primaryEmailAddress || 'Not available';
  const profileUrl = profileInfo.basicInfo?.profileUrl || '#';
  const profilePicture = profileInfo.basicInfo?.profilePicture?.croppedImage?.downloadUrl || '';
  const verifications = verificationReport.verifications || [];
  const verificationUrl = verificationReport.verificationUrl || '';
  
  const hasVerifications = verifications.length > 0;
  
  // Plus tier fields
  const education = profileInfo.mostRecentEducation;
  const experience = profileInfo.primaryCurrentPosition;
  
  const verificationCards = verifications.map(type => {
    const icons = {
      'IDENTITY': { emoji: '👤', title: 'Identity', subtitle: 'Your identity has been verified' },
      'WORKPLACE': { emoji: '🏢', title: 'Workplace', subtitle: 'Your workplace has been verified' }
    };
    const config = icons[type] || { emoji: '✓', title: type, subtitle: 'Verified' };
    
    return `
      <div class="verification-card has-tooltip">
        <div class="verification-icon">${config.emoji}</div>
        <div class="verification-info">
          <div class="verification-title">${config.title} <span class="tooltip-icon" data-tooltip-text="API: /verificationReport
Field: verifications
Type: ${type}">ⓘ</span></div>
          <div class="verification-subtitle">${config.subtitle}</div>
        </div>
        <div class="verification-check">✓</div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile - ${fullName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f3f2ef;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .profile-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 20px;
    }
    .profile-header {
      background: linear-gradient(135deg, #0A66C2 0%, #004182 100%);
      height: 200px;
      position: relative;
    }
    .profile-picture {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 8px solid white;
      object-fit: cover;
      background: #e0e0e0;
    }
    .profile-content {
      padding-top: 170px;
      padding-bottom: 30px;
      text-align: center;
    }
    .profile-name {
      font-size: 32px;
      color: #000;
      margin-bottom: 8px;
      font-weight: 600;
      display: inline-block;
    }
    .profile-email {
      color: #666;
      font-size: 16px;
      margin-bottom: 16px;
      display: inline-block;
    }
    .verified-badge {
      display: inline-flex;
      align-items: center;
      background: #e8f5e9;
      color: #2e7d32;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 24px;
    }
    .verified-badge::before {
      content: '✓';
      margin-right: 6px;
      font-weight: bold;
    }
    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
      padding: 0 20px;
    }
    .btn {
      background: #0A66C2;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    .btn:hover {
      background: #004182;
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: white;
      color: #0A66C2;
      border: 1px solid #0A66C2;
    }
    .btn-secondary:hover {
      background: #f3f2ef;
    }
    .section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 24px;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 20px;
      color: #000;
      margin-bottom: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .verification-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .verification-card:last-child {
      margin-bottom: 0;
    }
    .verification-icon {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    .verification-info {
      flex: 1;
    }
    .verification-title {
      font-size: 16px;
      font-weight: 600;
      color: #000;
      margin-bottom: 4px;
    }
    .verification-subtitle {
      font-size: 14px;
      color: #666;
    }
    .verification-check {
      color: #2e7d32;
      font-size: 24px;
      font-weight: bold;
    }
    .info-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .api-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }
    .api-title {
      font-size: 20px;
      color: #000;
      margin-bottom: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .collapsible {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .collapsible-header {
      padding: 16px;
      background: #f8f9fa;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      transition: background 0.3s ease;
    }
    .collapsible-header:hover {
      background: #e9ecef;
    }
    .collapsible-header-title {
      font-weight: 600;
      color: #000;
    }
    .collapsible-chevron {
      transition: transform 0.3s ease;
      color: #666;
    }
    .collapsible-chevron.open {
      transform: rotate(180deg);
    }
    .collapsible-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .collapsible-content.open {
      max-height: 600px;
      overflow-y: auto;
    }
    #tutorial-content.open {
      max-height: 8000px;
      overflow-y: auto;
    }
    pre {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
    }
    .tutorial-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 24px;
      margin-bottom: 20px;
    }
    .tutorial-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .tutorial-title {
      font-size: 24px;
      color: #000;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .tutorial-subtitle {
      font-size: 14px;
      color: #666;
    }
    .flow-step {
      position: relative;
      padding-left: 60px;
      margin-bottom: 32px;
    }
    .flow-step:last-child {
      margin-bottom: 0;
    }
    .flow-step:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 48px;
      bottom: -32px;
      width: 2px;
      background: linear-gradient(180deg, #0A66C2 0%, #e0e0e0 100%);
    }
    .step-number {
      position: absolute;
      left: 0;
      top: 0;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0A66C2 0%, #004182 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(10, 102, 194, 0.3);
    }
    .step-number.complete::after {
      content: '✓';
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      background: #2e7d32;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      border: 2px solid white;
    }
    .step-content {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #0A66C2;
    }
    .step-title {
      font-size: 18px;
      font-weight: 600;
      color: #000;
      margin-bottom: 8px;
    }
    .step-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .step-details {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      margin-top: 12px;
    }
    .detail-header {
      padding: 12px 16px;
      background: #fff;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.3s ease;
    }
    .detail-header:hover {
      background: #f8f9fa;
    }
    .detail-header-title {
      font-weight: 600;
      font-size: 13px;
      color: #0A66C2;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .detail-chevron {
      transition: transform 0.3s ease;
      color: #666;
      font-size: 12px;
    }
    .detail-chevron.open {
      transform: rotate(180deg);
    }
    .detail-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .detail-content.open {
      max-height: 2000px;
    }
    .detail-section {
      padding: 16px;
    }
    .detail-label {
      font-size: 11px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      border-radius: 6px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .code-block:last-child {
      margin-bottom: 0;
    }
    .code-comment {
      color: #6a9955;
    }
    .code-string {
      color: #ce9178;
    }
    .code-key {
      color: #9cdcfe;
    }
    .code-method {
      color: #dcdcaa;
    }
    .http-method {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 11px;
      margin-right: 8px;
    }
    .http-get {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .http-post {
      background: #e3f2fd;
      color: #1565c0;
    }
    .tooltip-icon {
      display: inline-block;
      font-size: 0.7em;
      color: #0A66C2;
      opacity: 0.6;
      margin-left: 4px;
      cursor: help;
      transition: opacity 0.2s ease;
      position: relative;
    }
    .btn .tooltip-icon {
      color: white;
      opacity: 0.8;
    }
    .btn-secondary .tooltip-icon {
      color: #0A66C2;
    }
    .has-tooltip {
      position: relative;
    }
    .tooltip-icon:hover {
      opacity: 1;
    }
    .tooltip-icon::after {
      content: attr(data-tooltip-text);
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: pre-line;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 10000;
      font-weight: normal;
      line-height: 1.6;
      max-width: 300px;
      text-align: left;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .tooltip-icon:hover::after {
      opacity: 1;
    }
    .profile-picture-container {
      position: relative;
      width: 300px;
      height: 300px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: -150px;
    }
    .picture-tooltip-icon {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #0A66C2;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: help;
      opacity: 0.8;
      transition: opacity 0.2s ease;
      z-index: 10;
      pointer-events: auto;
    }
    .picture-tooltip-icon:hover {
      opacity: 1;
    }
    .picture-tooltip-icon::after {
      content: attr(data-tooltip-text);
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: pre-line;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 10000;
      font-weight: normal;
      line-height: 1.6;
      max-width: 300px;
      text-align: left;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .picture-tooltip-icon:hover::after {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile-card">
      <div class="profile-header">
        ${profilePicture ? `
          <div class="profile-picture-container">
            <img src="${profilePicture}" alt="${fullName}" class="profile-picture">
            <span class="picture-tooltip-icon" data-tooltip-text="API: /identityMe
Field: basicInfo.profilePicture.croppedImage.downloadUrl">ⓘ</span>
          </div>
        ` : '<div class="profile-picture"></div>'}
      </div>
      <div class="profile-content">
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 20px;">
          <h1 class="profile-name has-tooltip">${fullName} <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: basicInfo.firstName.localized.en_US
Field: basicInfo.lastName.localized.en_US">ⓘ</span></h1>
        </div>
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 20px;">
          <p class="profile-email has-tooltip">${email} <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: basicInfo.primaryEmailAddress">ⓘ</span></p>
        </div>
        ${hasVerifications ? '<div class="verified-badge has-tooltip">Verified on LinkedIn <span class="tooltip-icon" data-tooltip-text="API: /verificationReport\nField: verifications">ⓘ</span></div>' : ''}
        <div style="background: #e3f2fd; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 14px; color: #1565c0; text-align: center;">
          💡 <strong>Tip:</strong> Hover over elements with the ⓘ icon to see their API source and field names
        </div>
        <div class="button-group">
          <a href="${profileUrl}" target="_blank" class="btn has-tooltip">View LinkedIn Profile <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: basicInfo.profileUrl">ⓘ</span></a>
          ${verificationUrl ? `<a href="${verificationUrl}" target="_blank" class="btn btn-secondary has-tooltip">Add More Verifications <span class="tooltip-icon" data-tooltip-text="API: /verificationReport
Field: verificationUrl">ⓘ</span></a>` : ''}
        </div>
      </div>
    </div>
    
    ${hasVerifications ? `
    <div class="section">
      <h2 class="section-title">🎉 Verifications</h2>
      ${verificationCards}
    </div>
    ` : ''}
    
    ${education ? `
    <div class="section">
      <h2 class="section-title">🎓 Education</h2>
      <div class="info-card has-tooltip">
        <div style="display: flex; align-items: center; gap: 16px;">
          ${education.schoolLogo?.originalImage?.downloadUrl ? `
            <img src="${education.schoolLogo.originalImage.downloadUrl}" alt="School Logo" style="width: 60px; height: 60px; border-radius: 8px; object-fit: contain;">
          ` : ''}
          <div style="flex: 1;">
            <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 4px;">
              ${education.schoolName?.localized?.en_US || education.schoolName?.localized?.[Object.keys(education.schoolName.localized)[0]] || 'School'}
              <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: mostRecentEducation.schoolName.localized">ⓘ</span>
            </div>
            ${education.degreeName ? `
              <div style="font-size: 14px; color: #666;">
                ${education.degreeName.localized?.en_US || education.degreeName.localized?.[Object.keys(education.degreeName.localized)[0]] || ''}
                <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: mostRecentEducation.degreeName.localized">ⓘ</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    
    ${experience ? `
    <div class="section">
      <h2 class="section-title">💼 Experience</h2>
      <div class="info-card has-tooltip">
        <div style="display: flex; align-items: center; gap: 16px;">
          ${experience.companyLogo?.originalImage?.downloadUrl ? `
            <img src="${experience.companyLogo.originalImage.downloadUrl}" alt="Company Logo" style="width: 60px; height: 60px; border-radius: 8px; object-fit: contain;">
          ` : ''}
          <div style="flex: 1;">
            <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 4px;">
              ${experience.title?.localized?.en_US || experience.title?.localized?.[Object.keys(experience.title.localized)[0]] || 'Position'}
              <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: primaryCurrentPosition.title.localized">ⓘ</span>
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">
              ${experience.companyName?.localized?.en_US || experience.companyName?.localized?.[Object.keys(experience.companyName.localized)[0]] || ''}
              <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: primaryCurrentPosition.companyName.localized">ⓘ</span>
            </div>
            ${experience.startedOn ? `
              <div style="font-size: 12px; color: #999;">
                Started: ${experience.startedOn.month || ''}${experience.startedOn.month && experience.startedOn.year ? '/' : ''}${experience.startedOn.year || ''}
                <span class="tooltip-icon" data-tooltip-text="API: /identityMe
Field: primaryCurrentPosition.startedOn">ⓘ</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    
    <div class="api-section">
      <h2 class="api-title">📋 API Response</h2>
      
      <div class="collapsible">
        <div class="collapsible-header" onclick="toggleCollapsible(this)">
          <span class="collapsible-header-title">Profile Information</span>
          <span class="collapsible-chevron">▼</span>
        </div>
        <div class="collapsible-content">
          <pre>${JSON.stringify(profileInfo, null, 2)}</pre>
        </div>
      </div>
      
      <div class="collapsible">
        <div class="collapsible-header" onclick="toggleCollapsible(this)">
          <span class="collapsible-header-title">Verification Report</span>
          <span class="collapsible-chevron">▼</span>
        </div>
        <div class="collapsible-content">
          <pre>${JSON.stringify(verificationReport, null, 2)}</pre>
        </div>
      </div>
    </div>
    
    <div class="tutorial-section">
      <div class="tutorial-header" onclick="toggleTutorial()" style="cursor: pointer; user-select: none;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="tutorial-title">🔐 Integration Steps and Commands</h2>
            <p class="tutorial-subtitle" style="margin-left: 32px;">Learn how this integration works behind the scenes</p>
          </div>
          <span class="collapsible-chevron" id="tutorial-chevron" style="font-size: 24px; margin-left: 16px;">▼</span>
        </div>
      </div>
      
      <div class="collapsible-content" id="tutorial-content">
        ${tutorialData}
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 32px; padding-bottom: 32px;">
      <a href="/" class="btn" style="display: inline-block; text-decoration: none;">⬅️ Back to Homepage</a>
    </div>
  </div>
  
  <script>
    function toggleCollapsible(header) {
      const content = header.nextElementSibling;
      const chevron = header.querySelector('.collapsible-chevron');
      
      content.classList.toggle('open');
      chevron.classList.toggle('open');
    }
    
    function toggleDetail(header) {
      const content = header.nextElementSibling;
      const chevron = header.querySelector('.detail-chevron');
      
      content.classList.toggle('open');
      chevron.classList.toggle('open');
    }
    
    function toggleTutorial() {
      const content = document.getElementById('tutorial-content');
      const chevron = document.getElementById('tutorial-chevron');
      
      content.classList.toggle('open');
      chevron.classList.toggle('open');
    }
  </script>
</body>
</html>`;
}

function getErrorPage(errorMessage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - LinkedIn Verification</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
      padding: 40px;
      text-align: center;
    }
    .error-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #d32f2f;
      font-size: 28px;
      margin-bottom: 16px;
    }
    p {
      color: #666;
      font-size: 16px;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    .btn {
      background: #0A66C2;
      color: white;
      border: none;
      padding: 14px 32px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    .btn:hover {
      background: #004182;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">❌</div>
    <h1>Authentication Failed</h1>
    <p>${errorMessage}</p>
    ${errorMessage === 'unauthorized_scope_error' ? `
    <div style="margin: 20px 0; padding: 16px; background: #fff3cd; border-left: 4px solid #ffc107; font-size: 14px; color: #856404; line-height: 1.6; text-align: left; border-radius: 4px;">
      <strong>⚠️ API Access Error:</strong> Your LinkedIn developer application either:<br>
      1. Lacks the 'Verified on LinkedIn' API product assignment, or<br>
      2. Is requesting a different tier than provisioned
    </div>
    ` : ''}
    <a href="/" class="btn">Try Again</a>
  </div>
</body>
</html>`;
}

async function exchangeCodeForToken(code, clientId, clientSecret) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI
  });
  
  const options = {
    hostname: 'www.linkedin.com',
    path: '/oauth/v2/accessToken',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': params.toString().length
    }
  };
  
  const response = await httpsRequest(options, params.toString());
  return response.access_token;
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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Home page
    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getHomePage());
    }
    
    // OAuth redirect endpoint
    else if (pathname === '/auth') {
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
          sessionStore[sessionId] = { clientId, clientSecret, apiTier, scopes };
          
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
    
    // Callback handler
    else if (pathname === '/callback') {
      const code = parsedUrl.query.code;
      const sessionId = parsedUrl.query.state;
      const error = parsedUrl.query.error;
      
      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getErrorPage(error));
        console.error('❌ Authentication error:', error);
        return;
      }
      
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(getErrorPage('No authorization code received'));
        return;
      }
      
      // Retrieve credentials from session
      const credentials = sessionStore[sessionId];
      
      if (!credentials) {
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
        console.log('\n' + '='.repeat(60));
        console.log('ACCESS TOKEN:');
        console.log(accessToken);
        console.log('='.repeat(60) + '\n');
        
        // Redirect to member profile with access token, client ID, and scopes for tutorial
        res.writeHead(302, { 
          'Location': `/memberProfile?token=${encodeURIComponent(accessToken)}&clientId=${encodeURIComponent(credentials.clientId)}&scopes=${encodeURIComponent(credentials.scopes)}`
        });
        res.end();
        
        // Clean up session
        delete sessionStore[sessionId];
        
        console.log('🔄 Redirecting to member profile page...');
        
      } catch (error) {
        console.error('❌ Error:', error.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(getErrorPage(error.message));
      }
    }
    
    // Member Profile page - makes fresh API calls on each load
    else if (pathname === '/memberProfile') {
      const accessToken = parsedUrl.query.token;
      const clientId = parsedUrl.query.clientId;
      const scopes = parsedUrl.query.scopes || 'r_verify r_profile_basicinfo';
      
      if (!accessToken) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(getErrorPage('No access token provided'));
        return;
      }
      
      try {
        // Fetch verification report
        console.log('📡 Fetching verification report...');
        console.log('\n💡 You can also run this curl command:');
        console.log(`curl -X GET 'https://api.linkedin.com/rest/verificationReport' \\`);
        console.log(`  -H 'LinkedIn-Version: 202510' \\`);
        console.log(`  -H 'Authorization: Bearer ${accessToken}'`);
        console.log('');
        
        const verificationReport = await fetchVerificationReport(accessToken);
        console.log('✅ Verification report received');
        
        // Fetch profile information
        console.log('\n📡 Fetching profile information...');
        console.log('\n💡 You can also run this curl command:');
        console.log(`curl -X GET 'https://api.linkedin.com/rest/identityMe' \\`);
        console.log(`  -H 'LinkedIn-Version: 202510.03' \\`);
        console.log(`  -H 'Authorization: Bearer ${accessToken}'`);
        console.log('');
        
        const profileInfo = await fetchProfileInfo(accessToken);
        console.log('✅ Profile information received');
        
        // Build tutorial data
        const tutorialHTML = buildTutorialSteps(accessToken, clientId, scopes);
        
        // Display profile page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getProfilePage(profileInfo, verificationReport, tutorialHTML));
        
        console.log('\n✅ Verification complete!\n');
        
      } catch (error) {
        console.error('❌ Error:', error.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(getErrorPage(error.message));
      }
    }
    
    // 404
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  } catch (error) {
    console.error('❌ Server error:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(getErrorPage('Internal server error: ' + error.message));
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
