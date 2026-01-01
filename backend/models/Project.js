const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Project",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      summary: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM("Pending", "Ongoing", "Completed"),
        allowNull: false,
        defaultValue: "Pending",
      },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "projects",
      timestamps: false,
      underscored: true,
    }
  );
