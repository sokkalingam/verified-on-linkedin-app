function getRedirectUri(req) {
  if (process.env.REDIRECT_URI_OVERRIDE) {
    return process.env.REDIRECT_URI_OVERRIDE;
  }
  if (process.env.BASE_URL) {
    return `${process.env.BASE_URL}/callback`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/callback`;
  }
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/callback`;
}

module.exports = { getRedirectUri };
