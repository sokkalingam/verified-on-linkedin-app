const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USAGE_FILE = path.join(DATA_DIR, 'usage.ndjson');

// Queue for handling concurrent writes
const writeQueue = [];
let isWriting = false;

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initialize usage file if it doesn't exist
function initializeUsageFile() {
  ensureDataDir();
  if (!fs.existsSync(USAGE_FILE)) {
    fs.writeFileSync(USAGE_FILE, '');
  }
}

// Process write queue - handles concurrent writes safely
function processWriteQueue() {
  if (isWriting || writeQueue.length === 0) {
    return;
  }
  
  isWriting = true;
  const entry = writeQueue.shift();
  
  try {
    // Append to file (atomic operation)
    fs.appendFileSync(USAGE_FILE, JSON.stringify(entry) + '\n');
  } catch (error) {
    console.error('❌ Error writing to usage log:', error.message);
  }
  
  isWriting = false;
  
  // Process next item in queue
  if (writeQueue.length > 0) {
    setImmediate(processWriteQueue);
  }
}

// Log usage event (queued for safe concurrent handling)
// eventType: 'form_submission', 'oauth_success', 'oauth_failure', 'api_success', 'api_failure'
function logUsage(clientId, tier, eventType) {
  initializeUsageFile();
  
  const entry = {
    timestamp: new Date().toISOString(),
    clientId: clientId || 'unknown',
    tier: tier || 'unknown',
    eventType: eventType
  };
  
  // Add to queue
  writeQueue.push(entry);
  
  // Start processing if not already processing
  processWriteQueue();
}

// Get all usage logs (parse NDJSON format)
function getAllUsageLogs() {
  initializeUsageFile();
  
  try {
    const data = fs.readFileSync(USAGE_FILE, 'utf8');
    if (!data.trim()) {
      return [];
    }
    
    // Parse newline-delimited JSON
    return data
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  } catch (error) {
    console.error('❌ Error reading usage logs:', error.message);
    return [];
  }
}

// Get usage statistics
function getUsageStats() {
  const logs = getAllUsageLogs();
  
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
    const eventType = log.eventType;
    
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
    if (!stats.byTier[log.tier]) {
      stats.byTier[log.tier] = {
        formSubmissions: 0,
        oauthSuccess: 0,
        oauthFailure: 0,
        apiSuccess: 0,
        apiFailure: 0
      };
    }
    if (eventType === 'form_submission') {
      stats.byTier[log.tier].formSubmissions++;
    } else if (eventType === 'oauth_success') {
      stats.byTier[log.tier].oauthSuccess++;
    } else if (eventType === 'oauth_failure') {
      stats.byTier[log.tier].oauthFailure++;
    } else if (eventType === 'api_success') {
      stats.byTier[log.tier].apiSuccess++;
    } else if (eventType === 'api_failure') {
      stats.byTier[log.tier].apiFailure++;
    }
    
    // Count by clientId
    if (!stats.byClientId[log.clientId]) {
      stats.byClientId[log.clientId] = {
        formSubmissions: 0,
        oauthSuccess: 0,
        oauthFailure: 0,
        apiSuccess: 0,
        apiFailure: 0
      };
    }
    if (eventType === 'form_submission') {
      stats.byClientId[log.clientId].formSubmissions++;
    } else if (eventType === 'oauth_success') {
      stats.byClientId[log.clientId].oauthSuccess++;
    } else if (eventType === 'oauth_failure') {
      stats.byClientId[log.clientId].oauthFailure++;
    } else if (eventType === 'api_success') {
      stats.byClientId[log.clientId].apiSuccess++;
    } else if (eventType === 'api_failure') {
      stats.byClientId[log.clientId].apiFailure++;
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
  getUsageStats
};
