import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Endpoint for Thần Dinh Dưỡng interactive chat/hints
app.post("/api/than-dinh-duong", async (req, res) => {
  try {
    const { prompt, studentName, studentGrade, currentRound } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: `Chào ${studentName || "nhà khám phá nhỏ"}! Thần Dinh Dưỡng đây! 🍎 Hẵy tiếp tục thử sức nhé, con đang làm rất xuất sắc!`,
      });
    }

    const systemInstruction = `Bạn là "Thần Dinh Dưỡng" – người dẫn đường vui tính, thân thiện, kiên nhẫn và rất giỏi động viên học sinh lớp 4 (10 tuổi) trong trò chơi "Hành Trình Khám Phá Thung Lũng Sức Khỏe".
Xưng "Thần" hoặc "Thần Dinh Dưỡng", gọi học sinh là "nhà khám phá nhỏ", "${studentName || 'con'}" hoặc "bạn nhỏ".
Dùng ngôn ngữ sinh động, ngộ nghĩnh, hào hứng với học sinh 10 tuổi, kèm emoji phong phú (🍎, 🥦, 🥩, 🧀, 🏆, ✨).
Trả lời ngắn gọn (2-4 câu), truyền năng lượng tích cực và chia sẻ kiến thức dinh dưỡng chuẩn lớp 4.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "Thần Dinh Dưỡng luôn đồng hành cùng con!" });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.json({ reply: `Chào ${req.body.studentName || "bạn nhỏ"}! Thần Dinh Dưỡng rất vui vì con đã nỗ lực hết mình. Hãy tiếp tục khám phá nhé! 🍎✨` });
  }
});

// Endpoint for evaluating custom advice given to Bi in Round 3
app.post("/api/evaluate-bi-advice", async (req, res) => {
  try {
    const { studentAdvice, studentName } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        isGood: true,
        feedback: `Lựa chọn tuyệt vời ${studentName || "bạn nhỏ"}! Lời khuyên của con rất chính xác. Bi cần ăn đủ 4 nhóm chất dinh dưỡng để cao lớn và thông minh hơn! 🏆`,
        points: 25
      });
    }

    const systemInstruction = `Bạn là "Thần Dinh Dưỡng" đánh giá lời khuyên của học sinh lớp 4 cho bạn Bi (Tình huống: Bạn Bi chỉ thích ăn thịt heo và cơm, không ăn xoài, măng cụt hay rau xà lách).
Hãy xem học sinh có giúp Bi hiểu rằng:
1. Bữa ăn chưa cân bằng (thiếu chất xơ, vitamin & khoáng chất).
2. Tác hại: Thiếu vitamin, dễ bị táo bón, sức đề kháng kém.
3. Lời khuyên: Cần ăn thêm rau xanh và trái cây tươi.

Trả về duy nhất JSON:
{
  "isGood": true,
  "feedback": "Lời nhận xét ấm áp, khen ngợi truyền cảm hứng từ Thần Dinh Dưỡng (2-3 câu)",
  "points": 25
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Lời khuyên của học sinh ${studentName || "bạn nhỏ"}: "${studentAdvice}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      isGood: parsed.isGood ?? true,
      feedback: parsed.feedback || "Lời khuyên của con rất chuẩn xác và giàu tình cảm!",
      points: parsed.points || 25
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.json({
      isGood: true,
      feedback: `Ôi xuất sắc quá ${req.body.studentName || "bạn nhỏ"}! Lời khuyên vô cùng ấm áp và chuẩn xác. Bạn Bi chắc chắn sẽ chăm ăn rau và trái cây hơn! 🥦🍎`,
      points: 25
    });
  }
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
