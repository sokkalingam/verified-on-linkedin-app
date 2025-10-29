function buildTutorialSteps(accessToken, clientId, scopes) {
  const maskedToken = accessToken ? `${accessToken.substring(0, 20)}...` : 'YOUR_ACCESS_TOKEN';
  const scopeList = scopes || 'r_verify r_profile_basicinfo';
  const scopeEncoded = encodeURIComponent(scopeList);
  
  return `
    <style>
      .api-doc-container {
        max-width: 100%;
        margin: 0 auto;
      }
      .api-step-card {
        background: white;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        margin-bottom: 24px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .api-step-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 20px 24px;
        border-bottom: 1px solid #e0e0e0;
      }
      .api-step-number {
        display: inline-block;
        background: #0A66C2;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        text-align: center;
        line-height: 32px;
        font-weight: 700;
        font-size: 16px;
        margin-right: 12px;
      }
      .api-step-title {
        display: inline-block;
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
        vertical-align: middle;
      }
      .api-step-body {
        padding: 24px;
      }
      .api-description {
        margin-bottom: 24px;
      }
      .api-code-section {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 2px solid #e9ecef;
      }
      .api-section-title {
        font-size: 14px;
        font-weight: 700;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        margin-top: 20px;
      }
      .api-section-title:first-child {
        margin-top: 0;
      }
      .api-description p {
        color: #333;
        line-height: 1.7;
        margin-bottom: 16px;
        font-size: 15px;
      }
      .api-param-list {
        list-style: none;
        padding: 0;
        margin: 12px 0;
      }
      .api-param-item {
        padding: 10px 0;
        border-bottom: 1px solid #e9ecef;
      }
      .api-param-item:last-child {
        border-bottom: none;
      }
      .api-param-name {
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
        color: #0A66C2;
        font-weight: 600;
      }
      .api-param-required {
        display: inline-block;
        background: #dc3545;
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 3px;
        margin-left: 8px;
        font-weight: 600;
      }
      .api-param-desc {
        color: #666;
        font-size: 13px;
        margin-top: 4px;
        line-height: 1.5;
      }
      .api-http-method {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 12px;
        margin-right: 8px;
        font-family: 'Monaco', 'Menlo', monospace;
      }
      .api-http-get {
        background: #d4edda;
        color: #155724;
      }
      .api-http-post {
        background: #cce5ff;
        color: #004085;
      }
      .api-endpoint {
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 14px;
        color: #333;
        font-weight: 600;
      }
      .api-code-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        border-bottom: 2px solid #e0e0e0;
      }
      .api-code-tab {
        padding: 8px 16px;
        background: transparent;
        border: none;
        color: #666;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition: all 0.2s;
      }
      .api-code-tab:hover {
        color: #0A66C2;
      }
      .api-code-tab.active {
        color: #0A66C2;
        border-bottom-color: #0A66C2;
      }
      .api-code-content {
        display: none;
      }
      .api-code-content.active {
        display: block;
      }
      .api-code-block {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 16px;
        padding-top: 40px;
        border-radius: 6px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        line-height: 1.6;
        overflow-x: auto;
        position: relative;
      }
      .api-code-block pre {
        margin: 0;
        background: transparent;
        padding: 0;
      }
      .api-copy-button {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #2d2d2d;
        border: 1px solid #444;
        color: #d4d4d4;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
        z-index: 10;
      }
      .api-copy-button:hover {
        background: #3d3d3d;
        border-color: #666;
      }
      .api-copy-button.copied {
        background: #2e7d32;
        border-color: #4caf50;
        color: white;
      }
      .api-copy-icon {
        width: 14px;
        height: 14px;
      }
      .api-json-key {
        color: #9cdcfe;
      }
      .api-json-string {
        color: #ce9178;
      }
      .api-json-number {
        color: #b5cea8;
      }
      .api-json-boolean {
        color: #569cd6;
      }
      .api-highlight {
        background: rgba(76, 175, 80, 0.2);
        padding: 2px 4px;
        border-radius: 3px;
      }
      .api-comment {
        color: #6a9955;
        font-style: italic;
      }
      .api-pointer {
        color: #4caf50;
        margin-left: 8px;
      }
      .api-note-box {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 12px 16px;
        margin-top: 16px;
        border-radius: 4px;
      }
      .api-note-title {
        font-weight: 700;
        color: #856404;
        margin-bottom: 6px;
        font-size: 13px;
      }
      .api-note-text {
        color: #856404;
        font-size: 13px;
        line-height: 1.6;
        margin: 4px 0;
      }
    </style>
    
    <div class="api-doc-container">
      
      <!-- Step 1: OAuth Authorization -->
      <div class="api-step-card">
        <div class="api-step-header">
          <span class="api-step-number">1</span>
          <span class="api-step-title">OAuth Authorization</span>
        </div>
        <div class="api-step-body">
          <div class="api-description">
            <div class="api-section-title">Overview</div>
            <p>Redirect users to LinkedIn's authorization page where they log in and grant permissions. After approval, LinkedIn redirects back to your callback URL with an authorization code.</p>
            
            <div class="api-section-title">Request</div>
            <p>
              <span class="api-http-method api-http-get">GET</span>
              <span class="api-endpoint">/oauth/v2/authorization</span>
            </p>
            
            <div class="api-section-title">Parameters</div>
            <ul class="api-param-list">
              <li class="api-param-item">
                <span class="api-param-name">response_type</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Must be set to <code>code</code></div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">client_id</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Your application's Client ID from LinkedIn Developer Portal</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">redirect_uri</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">URL where LinkedIn redirects after authorization</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">scope</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Space-separated list of permissions (e.g., <code>r_verify r_profile_basicinfo</code>)</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">state</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Random string for CSRF protection. Validate this matches on callback.</div>
              </li>
            </ul>
            
            <div class="api-section-title">Response</div>
            <p>LinkedIn redirects to your <code>redirect_uri</code> with:</p>
            <ul class="api-param-list">
              <li class="api-param-item">
                <span class="api-param-name">code</span>
                <div class="api-param-desc">Authorization code (single-use, expires in 30 minutes)</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">state</span>
                <div class="api-param-desc">Same value you sent (verify it matches)</div>
              </li>
            </ul>
          </div>
          
          <div class="api-code-section">
            <div class="api-code-tabs">
              <button class="api-code-tab active" onclick="switchTab(event, 'step1-template')">Template</button>
              <button class="api-code-tab" onclick="switchTab(event, 'step1-your')">Your Request</button>
            </div>
            
            <div id="step1-template" class="api-code-content active">
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step1-template-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step1-template-code">https://www.linkedin.com/oauth/v2/authorization
  ?response_type=<span class="api-json-string">code</span>
  &client_id=<span class="api-highlight">YOUR_CLIENT_ID</span>
  &redirect_uri=<span class="api-highlight">YOUR_REDIRECT_URI</span>
  &scope=<span class="api-highlight">r_verify r_profile_basicinfo</span>
  &state=<span class="api-highlight">RANDOM_STRING</span></pre>
              </div>
            </div>
            
            <div id="step1-your" class="api-code-content">
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step1-your-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step1-your-code"><span class="api-comment"># Your Client ID from LinkedIn Developer Portal</span>
https://www.linkedin.com/oauth/v2/authorization
  ?response_type=<span class="api-json-string">code</span>
  &client_id=<span class="api-highlight">${clientId || 'YOUR_CLIENT_ID'}</span>
  &redirect_uri=<span class="api-highlight">REDIRECT_URL</span>
  &scope=<span class="api-highlight">${scopeEncoded}</span>
  &state=<span class="api-highlight">DCEeFWf45A53sdfKef424</span></pre>
              </div>
              
              <div class="api-section-title" style="margin-top: 20px;">Callback Response</div>
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step1-callback-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step1-callback-code"><span class="api-comment"># Use this code in Step 2</span>
REDIRECT_URL
  ?code=<span class="api-highlight">AQTyJHbZxyz...</span>
  &state=<span class="api-highlight">DCEeFWf45A53sdfKef424</span></pre>
              </div>
            </div>
          </div>
          
          <div class="api-note-box">
            <div class="api-note-title">⚠️ Important</div>
            <div class="api-note-text">• Authorization codes expire in 30 minutes</div>
            <div class="api-note-text">• Always validate the state parameter</div>
            <div class="api-note-text">• Codes are single-use only</div>
          </div>
        </div>
      </div>
      
      <!-- Step 2: Token Exchange -->
      <div class="api-step-card">
        <div class="api-step-header">
          <span class="api-step-number">2</span>
          <span class="api-step-title">Exchange Code for Access Token</span>
        </div>
        <div class="api-step-body">
          <div class="api-description">
            <div class="api-section-title">Overview</div>
            <p>Exchange the authorization code from Step 1 for an access token. This token is used to make authenticated API requests on behalf of the user.</p>
            
            <div class="api-section-title">Request</div>
            <p>
              <span class="api-http-method api-http-post">POST</span>
              <span class="api-endpoint">/oauth/v2/accessToken</span>
            </p>
            <p style="margin-top: 8px; font-size: 13px; color: #666;">
              <strong>Content-Type:</strong> <code>application/x-www-form-urlencoded</code>
            </p>
            
            <div class="api-section-title">Body Parameters</div>
            <ul class="api-param-list">
              <li class="api-param-item">
                <span class="api-param-name">grant_type</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Must be <code>authorization_code</code></div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">code</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Authorization code from Step 1</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">client_id</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Your application's Client ID</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">client_secret</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Your application's Client Secret (keep secure!)</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">redirect_uri</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Must match the redirect_uri from Step 1</div>
              </li>
            </ul>
            
            <div class="api-section-title">Response</div>
            <p>Returns a JSON object containing:</p>
            <ul class="api-param-list">
              <li class="api-param-item">
                <span class="api-param-name">access_token</span>
                <div class="api-param-desc">Use this token for API requests</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">expires_in</span>
                <div class="api-param-desc">Token lifetime in seconds (typically 5184000 = 60 days)</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">scope</span>
                <div class="api-param-desc">Granted permissions</div>
              </li>
            </ul>
          </div>
          
          <div class="api-code-section">
            <div class="api-code-tabs">
              <button class="api-code-tab active" onclick="switchTab(event, 'step2-curl')">cURL</button>
              <button class="api-code-tab" onclick="switchTab(event, 'step2-response')">Response</button>
            </div>
            
            <div id="step2-curl" class="api-code-content active">
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step2-curl-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step2-curl-code"><span class="api-comment"># Authorization code from Step 1 callback</span>
<span class="api-comment"># Your Client ID from LinkedIn Developer Portal</span>
<span class="api-comment"># Your Client Secret (keep secure, never expose in frontend)</span>
curl -X POST 'https://www.linkedin.com/oauth/v2/accessToken' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=authorization_code' \\
  -d 'code=<span class="api-highlight">AQTyJHbZxyz...</span>' \\
  -d 'client_id=<span class="api-highlight">${clientId || 'YOUR_CLIENT_ID'}</span>' \\
  -d 'client_secret=<span class="api-highlight">YOUR_SECRET</span>' \\
  -d 'redirect_uri=<span class="api-highlight">REDIRECT_URL</span>'</pre>
              </div>
            </div>
            
            <div id="step2-response" class="api-code-content">
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step2-response-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step2-response-code"><span class="api-comment"># Use this access_token for API calls in Steps 3 & 4</span>
{
  <span class="api-json-key">"access_token"</span>: <span class="api-json-string">"AQV8..."</span>,
  <span class="api-json-key">"expires_in"</span>: <span class="api-json-number">5184000</span>,
  <span class="api-json-key">"scope"</span>: <span class="api-json-string">"r_verify,r_profile_basicinfo"</span>
}</pre>
              </div>
            </div>
          </div>
          
          <div class="api-note-box">
            <div class="api-note-title">⚠️ Security</div>
            <div class="api-note-text">• Never expose client_secret in browser/frontend code</div>
            <div class="api-note-text">• Store access tokens securely (encrypted database)</div>
            <div class="api-note-text">• Tokens are valid for 60 days</div>
          </div>
        </div>
      </div>
      
      <!-- Step 3: Fetch Verification Report -->
      <div class="api-step-card">
        <div class="api-step-header">
          <span class="api-step-number">3</span>
          <span class="api-step-title">Fetch Verification Report</span>
        </div>
        <div class="api-step-body">
          <div class="api-description">
            <div class="api-section-title">Overview</div>
            <p>Retrieve the user's verification status using the access token from Step 2. This returns completed verifications like IDENTITY and WORKPLACE.</p>
            
            <div class="api-section-title">Request</div>
            <p>
              <span class="api-http-method api-http-get">GET</span>
              <span class="api-endpoint">/rest/verificationReport</span>
            </p>
            
            <div class="api-section-title">Headers</div>
            <ul class="api-param-list">
              <li class="api-param-item">
                <span class="api-param-name">LinkedIn-Version</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">API version: <code>202510</code></div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">Authorization</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Bearer token from Step 2</div>
              </li>
            </ul>
            
            <div class="api-section-title">Response</div>
            <p>Returns a JSON object with:</p>
            <ul class="api-param-list">
              <li class="api-param-item">
                <span class="api-param-name">verifications</span>
                <div class="api-param-desc">Array of verification types (e.g., ["IDENTITY", "WORKPLACE"])</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">verificationUrl</span>
                <div class="api-param-desc">URL to add more verifications</div>
              </li>
            </ul>
          </div>
          
          <div class="api-code-section">
            <div class="api-code-tabs">
              <button class="api-code-tab active" onclick="switchTab(event, 'step3-curl')">cURL</button>
              <button class="api-code-tab" onclick="switchTab(event, 'step3-response')">Response</button>
            </div>
            
            <div id="step3-curl" class="api-code-content active">
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step3-curl-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step3-curl-code"><span class="api-comment"># Access token from Step 2</span>
curl -X GET 'https://api.linkedin.com/rest/verificationReport' \\
  -H 'LinkedIn-Version: 202510' \\
  -H 'Authorization: Bearer <span class="api-highlight">${accessToken || 'YOUR_ACCESS_TOKEN'}</span>'</pre>
              </div>
            </div>
            
            <div id="step3-response" class="api-code-content">
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step3-response-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step3-response-code">{
  <span class="api-json-key">"verifications"</span>: [
    <span class="api-json-string">"IDENTITY"</span>,
    <span class="api-json-string">"WORKPLACE"</span>
  ],
  <span class="api-json-key">"verificationUrl"</span>: <span class="api-json-string">"https://linkedin.com/..."</span>
}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Step 4: Fetch Identity Information -->
      <div class="api-step-card">
        <div class="api-step-header">
          <span class="api-step-number">4</span>
          <span class="api-step-title">Fetch Identity Information</span>
        </div>
        <div class="api-step-body">
          <div class="api-description">
            <div class="api-section-title">Overview</div>
            <p>Retrieve the user's profile information including name, email, profile picture, and profile URL using the access token.</p>
            
            <div class="api-section-title">Request</div>
            <p>
              <span class="api-http-method api-http-get">GET</span>
              <span class="api-endpoint">/rest/identityMe</span>
            </p>
            
            <div class="api-section-title">Headers</div>
            <ul class="api-param-list">
              <li class="api-param-item">
                <span class="api-param-name">LinkedIn-Version</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">API version: <code>202510.03</code></div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">Authorization</span>
                <span class="api-param-required">REQUIRED</span>
                <div class="api-param-desc">Bearer token from Step 2</div>
              </li>
            </ul>
            
            <div class="api-section-title">Response</div>
            <p>Returns profile data including:</p>
            <ul class="api-param-list">
              <li class="api-param-item">
                <span class="api-param-name">basicInfo</span>
                <div class="api-param-desc">Name, email, profile URL, profile picture</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">mostRecentEducation</span>
                <div class="api-param-desc">Education details (Plus tier only)</div>
              </li>
              <li class="api-param-item">
                <span class="api-param-name">primaryCurrentPosition</span>
                <div class="api-param-desc">Current job details (Plus tier only)</div>
              </li>
            </ul>
          </div>
          
          <div class="api-code-section">
            <div class="api-code-tabs">
              <button class="api-code-tab active" onclick="switchTab(event, 'step4-curl')">cURL</button>
              <button class="api-code-tab" onclick="switchTab(event, 'step4-response')">Response</button>
            </div>
            
            <div id="step4-curl" class="api-code-content active">
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step4-curl-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step4-curl-code"><span class="api-comment"># Access token from Step 2</span>
curl -X GET 'https://api.linkedin.com/rest/identityMe' \\
  -H 'LinkedIn-Version: 202510.03' \\
  -H 'Authorization: Bearer <span class="api-highlight">${accessToken || 'YOUR_ACCESS_TOKEN'}</span>'</pre>
              </div>
            </div>
            
            <div id="step4-response" class="api-code-content">
              <div class="api-code-block">
                <button class="api-copy-button" onclick="copyCode(this, 'step4-response-code')">
                  <svg class="api-copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span class="copy-text">Copy</span>
                </button>
<pre id="step4-response-code">{
  <span class="api-json-key">"basicInfo"</span>: {
    <span class="api-json-key">"firstName"</span>: {
      <span class="api-json-key">"localized"</span>: {
        <span class="api-json-key">"en_US"</span>: <span class="api-json-string">"John"</span>
      }
    },
    <span class="api-json-key">"lastName"</span>: { ... },
    <span class="api-json-key">"primaryEmailAddress"</span>: <span class="api-json-string">"john@example.com"</span>,
    <span class="api-json-key">"profileUrl"</span>: <span class="api-json-string">"https://linkedin.com/in/..."</span>,
    <span class="api-json-key">"profilePicture"</span>: { ... }
  }
}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <script>
      function switchTab(event, tabId) {
        // Get the parent tabs container
        const tabsContainer = event.target.parentElement;
        const codePanel = tabsContainer.parentElement;
        
        // Remove active class from all tabs in this container
        tabsContainer.querySelectorAll('.api-code-tab').forEach(tab => {
          tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        event.target.classList.add('active');
        
        // Hide all content in this panel
        codePanel.querySelectorAll('.api-code-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Show selected content
        document.getElementById(tabId).classList.add('active');
      }
      
      function copyCode(button, codeId) {
        const codeElement = document.getElementById(codeId);
        const textToCopy = codeElement.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy).then(() => {
          // Change button text and style
          const copyText = button.querySelector('.copy-text');
          const originalText = copyText.textContent;
          
          copyText.textContent = 'Copied!';
          button.classList.add('copied');
          
          // Reset after 2 seconds
          setTimeout(() => {
            copyText.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy:', err);
          alert('Failed to copy to clipboard');
        });
      }
    </script>
  `;
}

module.exports = { buildTutorialSteps };
