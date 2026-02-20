const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const SESSION_TABLE = 'sessions';
const SESSION_TTL_MINUTES = 10;

let supabaseClient = null;

// Fallback for local dev without Supabase configured
const memoryStore = {};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  session.service: SUPABASE_URL/ANON_KEY not set — using in-memory fallback (sessions will not survive cold starts)');
} else {
  console.log('✅ session.service: Supabase configured, sessions will be stored in DB');
}

function getClient() {
  if (supabaseClient) return supabaseClient;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const { createClient } = require('@supabase/supabase-js');
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

function expiryTimestamp() {
  return new Date(Date.now() - SESSION_TTL_MINUTES * 60 * 1000).toISOString();
}

async function createSession(sessionId, data) {
  const client = getClient();
  if (!client) {
    memoryStore[sessionId] = data;
    return;
  }
  // Lazy cleanup: remove any expired sessions before inserting a new one
  await client.from(SESSION_TABLE).delete().lt('created_at', expiryTimestamp());

  const { data: inserted, error } = await client.from(SESSION_TABLE).insert([{ session_id: sessionId, data }]).select();
  if (error) throw new Error(`Failed to create session: ${error.message}`);
  if (!inserted || inserted.length === 0) throw new Error('Session not stored — RLS may be blocking inserts on the sessions table');
}

async function getSession(sessionId) {
  const client = getClient();
  if (!client) return memoryStore[sessionId] || null;

  const { data, error } = await client
    .from(SESSION_TABLE)
    .select('data')
    .eq('session_id', sessionId)
    .gt('created_at', expiryTimestamp())
    .single();

  if (error || !data) return null;
  return data.data;
}

async function deleteSession(sessionId) {
  const client = getClient();
  if (!client) {
    delete memoryStore[sessionId];
    return;
  }
  await client.from(SESSION_TABLE).delete().eq('session_id', sessionId);
}

module.exports = { createSession, getSession, deleteSession };
