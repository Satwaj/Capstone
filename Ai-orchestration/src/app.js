import express from "express";
import morgan from "morgan";
import "dotenv/config"



const app = express();

// Middleware

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes

app.get("/api/ai/healthz", (req, res) => {
  res.json({ status: "ok" });
});


export default app;


