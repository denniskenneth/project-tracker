require("dotenv").config({ quiet: true });
const app = require("./app");
const { sequelize } = require("./models");

sequelize
  .authenticate()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection failed:", err.message));

app.listen(process.env.PORT || 5000, () => console.log("Server running"));
