const sequelize = require("../db");

const User = require("./User")(sequelize);
const Project = require("./Project")(sequelize);
const ActivityLog = require("./ActivityLog")(sequelize);

// Associations
User.hasMany(Project, { foreignKey: "created_by" });
Project.belongsTo(User, { foreignKey: "created_by" });

User.hasMany(ActivityLog, { foreignKey: "user_id" });
ActivityLog.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(ActivityLog, { foreignKey: "project_id" });
ActivityLog.belongsTo(Project, { foreignKey: "project_id" });

module.exports = { sequelize, User, Project, ActivityLog };
