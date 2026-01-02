require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();

    const email = process.env.ADMIN_EMAIL;
    const existing = await User.findOne({ where: { email } });

    if (existing) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }

    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = await User.create({
      username: process.env.ADMIN_USERNAME || "Admin",
      email,
      password,
      role: "admin",
    });

    console.log("Admin created:", admin.email);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
