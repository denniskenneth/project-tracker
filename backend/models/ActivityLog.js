const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "ActivityLog",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      project_id: { type: DataTypes.INTEGER, allowNull: true },
      action: { type: DataTypes.STRING(50), allowNull: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "activity_logs",
      timestamps: false,
      underscored: true,
    }
  );
