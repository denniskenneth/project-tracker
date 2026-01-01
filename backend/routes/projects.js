const express = require("express");
const { Op } = require("sequelize");
const auth = require("../middleware/auth");
const { Project, ActivityLog } = require("../models");

const router = express.Router();

const VALID_STATUSES = new Set(["Pending", "Ongoing", "Completed"]);

function validateProjectInput({ title, summary, status }) {
  if (!title || typeof title !== "string" || title.trim().length === 0)
    return "title is required";
  if (title.length > 150) return "title must be <= 150 characters";
  if (!summary || typeof summary !== "string" || summary.trim().length === 0)
    return "summary is required";
  if (status !== undefined && !VALID_STATUSES.has(status))
    return "status must be Pending, Ongoing, or Completed";
  return null;
}

async function logActivity({ user_id, project_id, action }) {
  // Bonus feature, but safe: if table doesn't exist or fails, don't break core flow
  try {
    if (!ActivityLog) return;
    await ActivityLog.create({ user_id, project_id, action });
  } catch (e) {
    console.warn("ACTIVITY_LOG_FAIL:", e?.message || e);
  }
}

async function getProjectOr404(id) {
  const project = await Project.findByPk(id);
  return project || null;
}

function canAccessProject(user, project) {
  if (!user || !project) return false;
  if (user.role === "admin") return true;
  return project.created_by === user.id;
}

/**
 * GET /api/projects
 * admin: all projects
 * user: only own projects
 */
router.get("/", auth, async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { created_by: req.user.id };
    const projects = await Project.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return res.json(projects);
  } catch (err) {
    console.error("GET_PROJECTS_ERR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/projects
 * body: { title, summary, status }
 */
router.post("/", auth, async (req, res) => {
  try {
    const { title, summary, status } = req.body || {};
    const errMsg = validateProjectInput({ title, summary, status });
    if (errMsg) return res.status(400).json({ message: errMsg });

    const project = await Project.create({
      title: title.trim(),
      summary: summary.trim(),
      status: status || "Pending",
      created_by: req.user.id,
    });

    await logActivity({
      user_id: req.user.id,
      project_id: project.id,
      action: "CREATE",
    });

    return res.status(201).json(project);
  } catch (err) {
    console.error("CREATE_PROJECT_ERR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/projects/:id
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ message: "Invalid id" });

    const project = await getProjectOr404(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(project);
  } catch (err) {
    console.error("GET_PROJECT_ERR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/projects/:id
 * body: { title, summary, status }
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ message: "Invalid id" });

    const project = await getProjectOr404(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, summary, status } = req.body || {};
    const errMsg = validateProjectInput({
      title: title ?? project.title,
      summary: summary ?? project.summary,
      status: status ?? project.status,
    });
    if (errMsg) return res.status(400).json({ message: errMsg });

    project.title = (title ?? project.title).trim();
    project.summary = (summary ?? project.summary).trim();
    project.status = status ?? project.status;

    await project.save();

    await logActivity({
      user_id: req.user.id,
      project_id: project.id,
      action: "UPDATE",
    });

    return res.json(project);
  } catch (err) {
    console.error("UPDATE_PROJECT_ERR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/projects/:id
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ message: "Invalid id" });

    const project = await getProjectOr404(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await logActivity({
      user_id: req.user.id,
      project_id: project.id,
      action: "DELETE",
    });
    await project.destroy();

    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE_PROJECT_ERR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
