// const express = require("express");
// const app = express();
// const router = express.Router();
// const path = require("path");

// app.use("/public", express.static(path.resolve("./", "public")));

// app.get("/*", (req, res) => {
//   try {
//     res.sendFile(path.resolve("./", "index.html"));
//   } catch (error) {
//     console.error("Error serving index.html:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.listen(3000, () => {
//   console.log("Server is running on http://localhost:3000");
// });

const express = require("express");
const app = express();
const path = require("path");

// Serve static files from the "public" directory
app.use("/public", express.static(path.resolve("./", "public")));

// Catch-all route for your SPA
app.get("/*", (req, res) => {
  try {
    res.sendFile(path.resolve("./", "index.html"));
  } catch (error) {
    console.error("Error serving index.html:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
