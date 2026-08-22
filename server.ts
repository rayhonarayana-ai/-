import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { defaultAIGateway } from "./server/ai/gateway.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Helper to extract client IP safely
function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

// Helper to extract or generate correlation request ID
function getRequestId(req: express.Request): string {
  const header = req.headers["x-request-id"];
  if (typeof header === "string" && header.trim().length > 0) {
    return header.trim().slice(0, 64);
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// 1. Chat endpoint with Zaki (AI Gateway)
app.post("/api/chat", async (req, res) => {
  const requestId = getRequestId(req);
  res.setHeader("X-Request-ID", requestId);

  try {
    const clientIp = getClientIp(req);
    const result = await defaultAIGateway.handleChat(req.body, clientIp, requestId);

    if (result.success && result.data) {
      return res.json({ reply: result.data.reply, requestId });
    } else {
      if (result.error?.category === "RATE_LIMITED") {
        return res.status(429).json({
          reply: result.fallbackData?.reply || result.error.safeUserMessage,
          error: result.error.category,
          retryAfterSeconds: result.error.retryAfterSeconds,
          requestId,
        });
      }

      if (result.error?.category === "INVALID_INPUT") {
        return res.status(400).json({
          reply: result.fallbackData?.reply || result.error.safeUserMessage,
          error: result.error.category,
          requestId,
        });
      }

      // AI unavailable or other graceful fallback
      return res.json({
        reply: result.fallbackData?.reply || result.error?.safeUserMessage || "أهلاً بك يا بطل! أنا زكي رفيقك الذكي. 🤖🚀",
        requestId,
      });
    }
  } catch (error: any) {
    console.error(`[Server Error] Route=/api/chat RequestId=${requestId}:`, error?.message);
    return res.status(500).json({
      reply: "أهلاً بك يا بطل! أنا زكي رفيقك الذكي. سؤالك رائع جداً، وتذكر أن الذكاء الاصطناعي يتعلم من التجربة والتكرار والبيانات تماماً كما نتعلم نحن بالتدريب المستمر! 🤖🚀",
      error: "INTERNAL_ERROR",
      requestId,
    });
  }
});

// 2. Prompt Lab endpoint (AI Gateway)
app.post("/api/prompt-lab", async (req, res) => {
  const requestId = getRequestId(req);
  res.setHeader("X-Request-ID", requestId);

  try {
    const clientIp = getClientIp(req);
    const result = await defaultAIGateway.handlePromptLab(req.body, clientIp, requestId);

    if (result.success && result.data) {
      return res.json({ result: result.data.result, requestId });
    } else {
      if (result.error?.category === "RATE_LIMITED") {
        return res.status(429).json({
          result: result.fallbackData?.result || result.error.safeUserMessage,
          error: result.error.category,
          retryAfterSeconds: result.error.retryAfterSeconds,
          requestId,
        });
      }

      if (result.error?.category === "INVALID_INPUT") {
        return res.status(400).json({
          result: result.fallbackData?.result || result.error.safeUserMessage,
          error: result.error.category,
          requestId,
        });
      }

      return res.json({
        result: result.fallbackData?.result || result.error?.safeUserMessage || "تم توليد فكرتك الإبداعية بنجاح في مختبر الأوامر! 🚀✨",
        requestId,
      });
    }
  } catch (error: any) {
    console.error(`[Server Error] Route=/api/prompt-lab RequestId=${requestId}:`, error?.message);
    return res.status(500).json({ error: "حدث خطأ في مختبر الأوامر.", requestId });
  }
});

// 3. Vision AI endpoint (AI Gateway)
app.post("/api/vision-explain", async (req, res) => {
  const requestId = getRequestId(req);
  res.setHeader("X-Request-ID", requestId);

  try {
    const clientIp = getClientIp(req);
    const result = await defaultAIGateway.handleVisionExplain(req.body, clientIp, requestId);

    if (result.success && result.data) {
      return res.json({
        explanation: result.data.explanation,
        aiGenerated: result.data.aiGenerated,
        requestId,
      });
    } else {
      if (result.error?.category === "RATE_LIMITED") {
        return res.status(429).json({
          explanation: result.fallbackData?.explanation || result.error.safeUserMessage,
          aiGenerated: false,
          error: result.error.category,
          retryAfterSeconds: result.error.retryAfterSeconds,
          requestId,
        });
      }

      if (result.error?.category === "INVALID_INPUT") {
        return res.status(400).json({
          explanation: result.fallbackData?.explanation || result.error.safeUserMessage,
          aiGenerated: false,
          error: result.error.category,
          requestId,
        });
      }

      return res.json({
        explanation: result.fallbackData?.explanation || result.error?.safeUserMessage || "تم تحليل الصورة بنجاح! 👁️💡",
        aiGenerated: false,
        requestId,
      });
    }
  } catch (error: any) {
    console.error(`[Server Error] Route=/api/vision-explain RequestId=${requestId}:`, error?.message);
    return res.status(500).json({ error: "تعذر تحليل الصورة حالياً.", requestId });
  }
});

// 4. Generate Interactive Quiz endpoint (AI Gateway)
app.post("/api/generate-quiz", async (req, res) => {
  const requestId = getRequestId(req);
  res.setHeader("X-Request-ID", requestId);

  try {
    const clientIp = getClientIp(req);
    const result = await defaultAIGateway.handleQuizGeneration(req.body, clientIp, requestId);

    if (result.success && result.data) {
      return res.json({ ...result.data, requestId });
    } else {
      if (result.error?.category === "RATE_LIMITED") {
        return res.status(429).json({ ...result.fallbackData, requestId });
      }

      // Always deliver valid quiz schema even under fallback
      return res.json({ ...result.fallbackData, requestId });
    }
  } catch (error: any) {
    console.error(`[Server Error] Route=/api/generate-quiz RequestId=${requestId}:`, error?.message);
    return res.status(500).json({ error: "تعذر إنشاء الاختبار.", requestId });
  }
});

// 5. Pedagogical Weekly Report endpoint (AI Gateway)
app.post("/api/pedagogical-report", async (req, res) => {
  const requestId = getRequestId(req);
  res.setHeader("X-Request-ID", requestId);

  try {
    const clientIp = getClientIp(req);
    const result = await defaultAIGateway.handlePedagogicalReport(req.body, clientIp, requestId);

    if (result.success && result.data) {
      return res.json({ report: result.data.report, requestId });
    } else {
      if (result.error?.category === "RATE_LIMITED") {
        return res.status(429).json({
          report: result.fallbackData?.report,
          error: result.error.category,
          retryAfterSeconds: result.error.retryAfterSeconds,
          requestId,
        });
      }

      return res.json({ report: result.fallbackData?.report, requestId });
    }
  } catch (error: any) {
    console.error(`[Server Error] Route=/api/pedagogical-report RequestId=${requestId}:`, error?.message);
    return res.status(500).json({ error: "تعذر توليد التقرير البيداغوجي حالياً.", requestId });
  }
});

// Health check (lightweight operational check, no external provider calls or secrets access)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-teacher",
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Kids AI Learning Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
