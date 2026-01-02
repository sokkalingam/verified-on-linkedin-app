function getLoginPage(errorMessage = '') {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard Login</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .login-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-header h1 {
          color: #333;
          font-size: 28px;
          margin-bottom: 8px;
        }
        
        .login-header p {
          color: #666;
          font-size: 14px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          color: #333;
          font-weight: 500;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        input[type="text"],
        input[type="password"] {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        
        input[type="text"]:focus,
        input[type="password"]:focus {
          outline: none;
          border-color: #667eea;
        }
        
        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border-left: 4px solid #c33;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="login-header">
          <h1>📊 Dashboard</h1>
          <p>Usage Analytics</p>
        </div>
        
        ${errorMessage ? `<div class="error-message">${errorMessage}</div>` : ''}
        
        <form method="POST">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required autofocus>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `;
}

function getDashboardPage(stats) {
  // Generate tier rows
  const tierRows = Object.entries(stats.byTier)
    .map(([tier, data]) => `
      <tr>
        <td>${tier}</td>
        <td>${data.formSubmissions}</td>
        <td>${data.oauthSuccess}</td>
        <td>${data.oauthFailure}</td>
        <td>${data.apiSuccess}</td>
        <td>${data.apiFailure}</td>
      </tr>
    `)
    .join('');
  
  // Generate top client rows
  const topClientRows = stats.topClients
    .map(client => `
      <tr>
        <td>${client.clientId}</td>
        <td>${client.formSubmissions}</td>
        <td>${client.oauthSuccess}</td>
        <td>${client.oauthFailure}</td>
        <td>${client.apiSuccess}</td>
        <td>${client.apiFailure}</td>
      </tr>
    `)
    .join('');
  
  // Generate all client rows
  const allClientRows = Object.entries(stats.byClientId)
    .map(([clientId, data]) => ({ clientId, ...data }))
    .sort((a, b) => {
      const totalA = a.formSubmissions + a.oauthSuccess + a.oauthFailure + a.apiSuccess + a.apiFailure;
      const totalB = b.formSubmissions + b.oauthSuccess + b.oauthFailure + b.apiSuccess + b.apiFailure;
      return totalB - totalA;
    })
    .map(client => `
      <tr>
        <td>${client.clientId}</td>
        <td>${client.formSubmissions}</td>
        <td>${client.oauthSuccess}</td>
        <td>${client.oauthFailure}</td>
        <td>${client.apiSuccess}</td>
        <td>${client.apiFailure}</td>
      </tr>
    `)
    .join('');
  
  // Generate daily breakdown rows
  const dailyRows = Object.entries(stats.dailyBreakdown)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 30)
    .map(([date, data]) => `
      <tr>
        <td>${date}</td>
        <td>${data.formSubmissions}</td>
        <td>${data.oauthSuccess}</td>
        <td>${data.oauthFailure}</td>
        <td>${data.apiSuccess}</td>
        <td>${data.apiFailure}</td>
      </tr>
    `)
    .join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard - Usage Analytics</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #f5f7fa;
          color: #333;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .header h1 {
          font-size: 32px;
          color: #333;
        }
        
        .logout-btn {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
        }
        
        .logout-btn:hover {
          background: #764ba2;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #667eea;
        }
        
        .stat-card.success {
          border-left-color: #10b981;
        }
        
        .stat-card.danger {
          border-left-color: #ef4444;
        }
        
        .stat-card.info {
          border-left-color: #3b82f6;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #333;
        }
        
        .stat-subtext {
          font-size: 12px;
          color: #999;
          margin-top: 8px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #333;
        }
        
        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }
        
        th {
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        td {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        
        tbody tr:hover {
          background: #f9fafb;
        }
        
        tbody tr:last-child td {
          border-bottom: none;
        }
        
        .empty-message {
          padding: 40px;
          text-align: center;
          color: #999;
        }
        
        .footer {
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Dashboard</h1>
          <a href="/" class="logout-btn">← Back to Home</a>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Form Submissions</div>
            <div class="stat-value">${stats.formSubmissions}</div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-label">OAuth Success</div>
            <div class="stat-value">${stats.oauthSuccess}</div>
          </div>
          
          <div class="stat-card danger">
            <div class="stat-label">OAuth Failures</div>
            <div class="stat-value">${stats.oauthFailure}</div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-label">API Success</div>
            <div class="stat-value">${stats.apiSuccess}</div>
          </div>
          
          <div class="stat-card danger">
            <div class="stat-label">API Failures</div>
            <div class="stat-value">${stats.apiFailure}</div>
          </div>
          
          <div class="stat-card info">
            <div class="stat-label">Unique Clients</div>
            <div class="stat-value">${Object.keys(stats.byClientId).length}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Usage by Tier</div>
          <div class="table-container">
            ${tierRows ? `
              <table>
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Form Submissions</th>
                    <th>OAuth Success</th>
                    <th>OAuth Failures</th>
                    <th>API Success</th>
                    <th>API Failures</th>
                  </tr>
                </thead>
                <tbody>
                  ${tierRows}
                </tbody>
              </table>
            ` : '<div class="empty-message">No data available</div>'}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Top 10 Clients</div>
          <div class="table-container">
            ${topClientRows ? `
              <table>
                <thead>
                  <tr>
                    <th>Client ID</th>
                    <th>Form Submissions</th>
                    <th>OAuth Success</th>
                    <th>OAuth Failures</th>
                    <th>API Success</th>
                    <th>API Failures</th>
                  </tr>
                </thead>
                <tbody>
                  ${topClientRows}
                </tbody>
              </table>
            ` : '<div class="empty-message">No data available</div>'}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">All Clients</div>
          <div class="table-container">
            ${allClientRows ? `
              <table>
                <thead>
                  <tr>
                    <th>Client ID</th>
                    <th>Form Submissions</th>
                    <th>OAuth Success</th>
                    <th>OAuth Failures</th>
                    <th>API Success</th>
                    <th>API Failures</th>
                  </tr>
                </thead>
                <tbody>
                  ${allClientRows}
                </tbody>
              </table>
            ` : '<div class="empty-message">No data available</div>'}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Daily Breakdown (Last 30 Days)</div>
          <div class="table-container">
            ${dailyRows ? `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Form Submissions</th>
                    <th>OAuth Success</th>
                    <th>OAuth Failures</th>
                    <th>API Success</th>
                    <th>API Failures</th>
                  </tr>
                </thead>
                <tbody>
                  ${dailyRows}
                </tbody>
              </table>
            ` : '<div class="empty-message">No data available</div>'}
          </div>
        </div>
        
        <div class="footer">
          Last updated: ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  getLoginPage,
  getDashboardPage
};
