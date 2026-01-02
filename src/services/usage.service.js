// Supabase Configuration
// Check multiple environment variable names for compatibility
const SUPABASE_URL = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_ANON_KEY = 
  process.env.SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const NODE_ENV = process.env.NODE_ENV || 'development';

// Determine which table to use based on environment
const USAGE_TABLE = NODE_ENV === 'production' ? 'usage_logs' : 'usage_logs_local';

let supabaseClient = null;

// Initialize Supabase client
async function initializeDatabase() {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required!');
      console.error('   Please set these in your .env.local or Vercel environment variables');
      process.exit(1);
    }
    
    try {
      const { createClient } = require('@supabase/supabase-js');
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // Test connection by querying the table schema
      const { data, error } = await supabaseClient
        .from(USAGE_TABLE)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Failed to connect to Supabase table:', error.message);
        console.error('   Table:', USAGE_TABLE);
        console.error('   Error details:', error);
        process.exit(1);
      }
      
      const env = NODE_ENV === 'production' ? '🔴 PRODUCTION' : '🟢 LOCAL DEV';
      console.log(`✅ Connected to Supabase for usage tracking [${env}]`);
      console.log(`   Table: ${USAGE_TABLE}`);
      console.log(`   URL: ${SUPABASE_URL}`);
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error.message);
      console.error('   Stack:', error.stack);
      process.exit(1);
    }
  }
}

// Log usage event to Supabase
// eventType: 'form_submission', 'oauth_success', 'oauth_failure', 'api_success', 'api_failure'
async function logUsage(clientId, tier, eventType) {
  if (!supabaseClient) {
    console.error('❌ Supabase client not initialized. Call initializeDatabase() first.');
    return;
  }
  
  // Use lowercase column names to match Supabase table schema
  const entry = {
    timestamp: new Date().toISOString(),
    clientid: clientId || 'unknown',
    tier: tier || 'unknown',
    eventtype: eventType
  };
  
  try {
    const { error } = await supabaseClient
      .from(USAGE_TABLE)
      .insert([entry]);
    
    if (error) {
      console.error('❌ Error writing to Supabase:', error.message);
    }
  } catch (error) {
    console.error('❌ Error writing to Supabase:', error.message);
  }
}

// Get all usage logs from Supabase
async function getAllUsageLogs() {
  if (!supabaseClient) {
    console.error('❌ Supabase client not initialized. Call initializeDatabase() first.');
    return [];
  }
  
  try {
    const { data, error } = await supabaseClient
      .from(USAGE_TABLE)
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('❌ Error reading from Supabase:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error reading from Supabase:', error.message);
    return [];
  }
}

// Get usage statistics
async function getUsageStats() {
  const logs = await getAllUsageLogs();
  
  if (logs.length === 0) {
    return {
      formSubmissions: 0,
      oauthSuccess: 0,
      oauthFailure: 0,
      apiSuccess: 0,
      apiFailure: 0,
      byTier: {},
      byClientId: {},
      dailyBreakdown: {},
      topClients: []
    };
  }
  
  const stats = {
    formSubmissions: 0,
    oauthSuccess: 0,
    oauthFailure: 0,
    apiSuccess: 0,
    apiFailure: 0,
    byTier: {},
    byClientId: {},
    dailyBreakdown: {},
    topClients: []
  };
  
  // Count events by type
  logs.forEach(log => {
    // Use lowercase column names to match Supabase schema
    const eventType = log.eventtype;
    const clientId = log.clientid;
    const tier = log.tier;
    
    // Count overall events
    if (eventType === 'form_submission') {
      stats.formSubmissions++;
    } else if (eventType === 'oauth_success') {
      stats.oauthSuccess++;
    } else if (eventType === 'oauth_failure') {
      stats.oauthFailure++;
    } else if (eventType === 'api_success') {
      stats.apiSuccess++;
    } else if (eventType === 'api_failure') {
      stats.apiFailure++;
    }
    
    // Count by tier
    if (!stats.byTier[tier]) {
      stats.byTier[tier] = {
        formSubmissions: 0,
        oauthSuccess: 0,
        oauthFailure: 0,
        apiSuccess: 0,
        apiFailure: 0
      };
    }
    if (eventType === 'form_submission') {
      stats.byTier[tier].formSubmissions++;
    } else if (eventType === 'oauth_success') {
      stats.byTier[tier].oauthSuccess++;
    } else if (eventType === 'oauth_failure') {
      stats.byTier[tier].oauthFailure++;
    } else if (eventType === 'api_success') {
      stats.byTier[tier].apiSuccess++;
    } else if (eventType === 'api_failure') {
      stats.byTier[tier].apiFailure++;
    }
    
    // Count by clientId
    if (!stats.byClientId[clientId]) {
      stats.byClientId[clientId] = {
        formSubmissions: 0,
        oauthSuccess: 0,
        oauthFailure: 0,
        apiSuccess: 0,
        apiFailure: 0
      };
    }
    if (eventType === 'form_submission') {
      stats.byClientId[clientId].formSubmissions++;
    } else if (eventType === 'oauth_success') {
      stats.byClientId[clientId].oauthSuccess++;
    } else if (eventType === 'oauth_failure') {
      stats.byClientId[clientId].oauthFailure++;
    } else if (eventType === 'api_success') {
      stats.byClientId[clientId].apiSuccess++;
    } else if (eventType === 'api_failure') {
      stats.byClientId[clientId].apiFailure++;
    }
    
    // Daily breakdown
    const date = log.timestamp.split('T')[0];
    if (!stats.dailyBreakdown[date]) {
      stats.dailyBreakdown[date] = {
        formSubmissions: 0,
        oauthSuccess: 0,
        oauthFailure: 0,
        apiSuccess: 0,
        apiFailure: 0
      };
    }
    if (eventType === 'form_submission') {
      stats.dailyBreakdown[date].formSubmissions++;
    } else if (eventType === 'oauth_success') {
      stats.dailyBreakdown[date].oauthSuccess++;
    } else if (eventType === 'oauth_failure') {
      stats.dailyBreakdown[date].oauthFailure++;
    } else if (eventType === 'api_success') {
      stats.dailyBreakdown[date].apiSuccess++;
    } else if (eventType === 'api_failure') {
      stats.dailyBreakdown[date].apiFailure++;
    }
  });
  
  // Get top clients (by total events)
  stats.topClients = Object.entries(stats.byClientId)
    .map(([clientId, data]) => ({
      clientId,
      ...data,
      total: data.formSubmissions + data.oauthSuccess + data.oauthFailure + data.apiSuccess + data.apiFailure
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  
  return stats;
}

module.exports = {
  logUsage,
  getAllUsageLogs,
  getUsageStats,
  initializeDatabase
};
