export default async function handler(req, res) {
  try {
    const { default: app } = await import("../backend/server.js");
    return app(req, res);
  } catch (err) {
    console.error("Vercel Function Init Error:", err);
    return res.status(500).json({
      error: `Serverless Function Initialization Error: ${err.message || String(err)}`,
      stack: err.stack
    });
  }
}
