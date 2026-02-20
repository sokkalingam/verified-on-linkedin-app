function getRedirectUri(req) {
  if (process.env.REDIRECT_URI_OVERRIDE) {
    return process.env.REDIRECT_URI_OVERRIDE;
  }
  // On Vercel production, use the stable registered domain (BASE_URL)
  if (process.env.VERCEL_ENV === 'production' && process.env.BASE_URL) {
    return `${process.env.BASE_URL}/callback`;
  }
  // On Vercel preview, use the per-deployment URL so the callback
  // returns to this deployment (not production which runs different code)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/callback`;
  }
  // Local dev fallback
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/callback`;
}

module.exports = { getRedirectUri };
