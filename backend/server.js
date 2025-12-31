const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
