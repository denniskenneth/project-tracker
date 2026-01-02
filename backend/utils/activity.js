const { ActivityLog } = require("../models");

async function logActivity({ user_id, project_id = null, action }) {
  try {
    await ActivityLog.create({ user_id, project_id, action });
  } catch (e) {
    // Never break core flow because logging failed
    console.warn("ACTIVITY_LOG_FAIL:", e?.message || e);
  }
}

module.exports = { logActivity };
