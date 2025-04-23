"use strict";

const app = require("./app");
const { PORT } = require("./config"); // Import PORT from config.js

app.listen(PORT, function () {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
