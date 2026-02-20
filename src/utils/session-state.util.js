const crypto = require('crypto');

// Use a dedicated SESSION_SECRET or fall back to the Supabase anon key,
// which is already required and consistent across all Lambda instances.
function getSecret() {
  const key =
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!key) {
    if (process.env.VERCEL_ENV === 'production') {
      throw new Error('No signing secret configured. Set SESSION_SECRET or SUPABASE_ANON_KEY.');
    }
    return 'dev-only-insecure-fallback';
  }
  return key;
}

function encodeState(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function decodeState(state) {
  if (!state || typeof state !== 'string') return null;
  const dotIndex = state.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const payload = state.slice(0, dotIndex);
  const signature = state.slice(dotIndex + 1);

  const expectedSig = crypto.createHmac('sha256', getSecret()).update(payload).digest();
  const actualSig = Buffer.from(signature, 'base64url');

  if (actualSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(actualSig, expectedSig)) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

module.exports = { encodeState, decodeState };
