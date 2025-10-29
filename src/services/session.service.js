// Store credentials temporarily (in production, use sessions or secure storage)
let sessionStore = {};

function createSession(sessionId, data) {
  sessionStore[sessionId] = data;
}

function getSession(sessionId) {
  return sessionStore[sessionId];
}

function deleteSession(sessionId) {
  delete sessionStore[sessionId];
}

module.exports = {
  createSession,
  getSession,
  deleteSession
};
