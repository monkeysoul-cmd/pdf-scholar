import app from "../backend/server.js";

export default function handler(req, res) {
  return new Promise((resolve, reject) => {
    res.on("finish", resolve);
    res.on("close", resolve);
    res.on("error", (err) => {
      console.error("Vercel response error:", err);
      resolve();
    });
    app(req, res);
  });
}
