const express = require("express");
const auth = require("../middleware/auth");
const { ActivityLog, User, Project } = require("../models");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

/**
 * GET /api/activity-logs
 * admin: sees all logs
 * user: sees only their own logs
 */
router.get("/", auth, requireAdmin, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      order: [["created_at", "DESC"]],
      limit: 200,
      include: [
        { model: User, attributes: ["id", "username", "email", "role"] },
        { model: Project, attributes: ["id", "title", "status"] },
      ],
    });

    res.json(logs);
  } catch (e) {
    console.error("GET_LOGS_ERR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/activity-logs  (optional cleanup endpoint)
 * admin only
 */
router.delete("/", auth, requireAdmin, async (req, res) => {
  try {
    await ActivityLog.destroy({ where: {} });
    res.json({ message: "All logs cleared" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
