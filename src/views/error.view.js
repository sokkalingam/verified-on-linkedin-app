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

module.exports = { getErrorPage };
