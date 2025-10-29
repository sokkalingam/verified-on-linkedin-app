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

module.exports = { buildTutorialSteps };
