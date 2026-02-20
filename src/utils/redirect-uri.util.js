function getRedirectUri(req) {
  if (process.env.REDIRECT_URI_OVERRIDE) {
    return process.env.REDIRECT_URI_OVERRIDE;
  }
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/callback`;
}

module.exports = { getRedirectUri };
