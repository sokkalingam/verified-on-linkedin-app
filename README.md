# LinkedIn Verification Application

A Node.js application for LinkedIn OAuth verification and profile integration.

## Project Structure

```
/verified-on-linkedin-app
├── src/
│   ├── config/
│   │   └── index.js                 # Configuration & environment variables
│   ├── services/
│   │   ├── linkedin.service.js      # LinkedIn API interactions
│   │   └── session.service.js       # Session management
│   ├── views/
│   │   ├── home.view.js             # Home page HTML template
│   │   ├── profile.view.js          # Profile page HTML template
│   │   ├── error.view.js            # Error page HTML template
│   │   └── tutorial.view.js         # Tutorial steps HTML template
│   ├── routes/
│   │   ├── home.route.js            # Home page route handler
│   │   ├── auth.route.js            # OAuth flow routes
│   │   └── profile.route.js         # Profile page route handler
│   ├── utils/
│   │   └── https.util.js            # HTTPS request helper
│   └── server.js                    # Main server setup
├── .gitignore                       # Git ignore file
├── package.json                     # Dependencies & scripts
└── README.md                        # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- LinkedIn Developer Account
- LinkedIn App with OAuth credentials

### Installation

1. Clone the repository
2. No dependencies to install (uses native Node.js modules only)

### Configuration

The application automatically detects the base URL based on your environment:
- `BASE_URL` environment variable (if set)
- `RENDER_EXTERNAL_URL` (for Render deployments)
- `REPLIT_DOMAINS` (for Replit)
- Falls back to `http://localhost:5000` for local development

### Running the Application

```bash
npm start
```

The server will start on port 5000 by default and display:
- The base URL
- The redirect URI to add to your LinkedIn app

### LinkedIn App Setup

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Select your app → **Auth** tab
3. Under "OAuth 2.0 settings", add the redirect URI shown in the console
4. Request access to required products (Verified on LinkedIn)

### Usage

1. Open the application in your browser
2. Enter your LinkedIn Client ID and Client Secret
3. Select your API tier (Development, Lite, or Plus)
4. Click "Verify on LinkedIn"
5. Authorize the application on LinkedIn
6. View your profile and verification status

## Features

- OAuth 2.0 authentication with LinkedIn
- Profile information display
- Verification status checking
- API tier support (Development, Lite, Plus)
- Interactive tutorial with API documentation
- Detailed API response inspection

## API Tiers

- **Development/Lite**: Basic profile info and verification status
- **Plus**: Additional education and experience data

## Security Notes

- Client secrets are stored temporarily in memory during the OAuth flow
- Sessions are cleaned up after token exchange
- For production, use a proper session store (e.g., Redis)
- Never commit credentials to version control

## License

MIT
