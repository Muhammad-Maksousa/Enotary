const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const app = express();


app.use(
  cors({
    origin: "*", // DEV ONLY — DO NOT USE IN PRODUCTION
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logger
app.use(logger("dev"));

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(require("./routers"));

app.use(require("./helpers/errors/custom-errors").defaultHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", (err) => {
      console.error("Server error:", err);
    });
  } catch (error) {
    console.error("Failed to start server:");
    console.error(error);

    // Optional: exit process so container/process managers can restart it
    process.exit(1);
  }
};

startServer();
