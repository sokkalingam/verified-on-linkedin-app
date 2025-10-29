const PORT = 5000;
const BASE_URL = process.env.BASE_URL || 
                 process.env.RENDER_EXTERNAL_URL || 
                 (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : 
                 `http://localhost:${PORT}`);
const REDIRECT_URI = `${BASE_URL}/callback`;

module.exports = {
  PORT,
  BASE_URL,
  REDIRECT_URI
};
