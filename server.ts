import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware to parse incoming request payloads
  app.use(express.json());

  // API Route - STK Push Proxy to bypass CORS completely
  app.post("/api/proxy-stk", async (req, res) => {
    try {
      let { vercelApiUrl, headers, payload } = req.body;
      
      // Prioritize server-configured environment variables for production security
      const envUrl = process.env.MPESA_STK_API_URL;
      const envHeadersStr = process.env.MPESA_STK_API_HEADERS;

      let targetUrl = envUrl ? envUrl.trim() : (vercelApiUrl ? vercelApiUrl.trim() : 'https://aviatokenya254.vercel.app/api/sasapay-pay');
      let targetHeaders = headers || { "Content-Type": "application/json" };

      if (envHeadersStr) {
        try {
          const parsedEnvHeaders = JSON.parse(envHeadersStr);
          targetHeaders = { ...targetHeaders, ...parsedEnvHeaders };
        } catch (e) {
          console.error("[Proxy Gateway] Failed to parse MPESA_STK_API_HEADERS env string, using default headers.", e);
        }
      }

      if (!targetUrl) {
        return res.status(400).json({ error: "Missing STK endpoint URL configuration." });
      }

      // Proactively enforce HTTPS protocols to secure transit handshakes
      if (targetUrl.startsWith("http://")) {
        targetUrl = targetUrl.replace("http://", "https://");
      }

      console.log(`[Proxy Gateway] Securely relaying STK request to HTTPS target: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: targetHeaders,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData = {};
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }

      console.log(`[Proxy] Target responded with status ${response.status}`);
      res.status(response.status).json(responseData);
    } catch (e: any) {
      console.error("[Proxy Gateway Error]:", e);
      res.status(500).json({ error: e.message || "Failed to establish a secure server-side HTTPS proxy connection." });
    }
  });

  // Simple status health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // Vite integration middleware based on runtime environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fullstack Server] Running securely with enforced server HTTPS relaying on port ${PORT}`);
  });
}

startServer();
