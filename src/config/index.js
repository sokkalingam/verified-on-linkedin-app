const PORT = 5000;

const getBaseUrl = () => {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  if (process.env.REPLIT_DOMAINS) return `https://${process.env.REPLIT_DOMAINS}`;
  return `http://localhost:${PORT}`;
};

const BASE_URL = getBaseUrl();
const REDIRECT_URI = `${BASE_URL}/callback`;

module.exports = {
  PORT,
  BASE_URL,
  REDIRECT_URI
};