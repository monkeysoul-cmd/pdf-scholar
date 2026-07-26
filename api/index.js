import express from "express";

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

app.post("/api/auth/login", (req, res) => {
  res.json({ test: "working", body: req.body });
});

export default function handler(req, res) {
  return new Promise((resolve) => {
    res.on("finish", resolve);
    res.on("close", resolve);
    app(req, res);
  });
}
