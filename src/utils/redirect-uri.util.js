function getRedirectUri(req) {
  if (process.env.REDIRECT_URI_OVERRIDE) {
    return process.env.REDIRECT_URI_OVERRIDE;
  }
  // On Vercel production, use the stable registered domain (BASE_URL)
  if (process.env.VERCEL_ENV === 'production' && process.env.BASE_URL) {
    return `${process.env.BASE_URL}/callback`;
  }
  // Derive redirect URI from the actual request host.
  // On Vercel preview this gives the stable branch URL (same across all pushes),
  // rather than VERCEL_URL which is deployment-specific and changes every push.
  // x-forwarded-proto and x-forwarded-host are set reliably by Vercel's edge layer.
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/callback`;
}

module.exports = { getRedirectUri };
