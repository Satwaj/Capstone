import express from "express";
import morgan from "morgan";
import "dotenv/config"
import agentRouter from "./routes/agent.routes.js";



const app = express();


// Middleware

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes

app.get("/api/status/healthz", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/ai", agentRouter);

export default app;


