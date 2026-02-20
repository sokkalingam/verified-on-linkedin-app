function getRedirectUri(req) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const uri = `${proto}://${host}/callback`;
  console.log('🌐 getRedirectUri — proto:', proto, '| host:', host, '| uri:', uri);
  return uri;
}

module.exports = { getRedirectUri };
