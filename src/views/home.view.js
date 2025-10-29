const { REDIRECT_URI } = require('../config');

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

module.exports = { getHomePage };
