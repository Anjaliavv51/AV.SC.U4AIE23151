import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Log } from "./logger";
import router from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Request logging middleware
app.use(async (req, _res, next) => {
  await Log("backend", "info", "middleware",
    `Incoming request: ${req.method} ${req.path}`);
  next();
});

// Root route - health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Notification backend is running" });
});

// Routes
app.use("/api", router);

// Start server
app.listen(PORT, async () => {
  await Log("backend", "info", "config",
    `Notification backend server started on port ${PORT}`);
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/notifications`);
});

export default app;