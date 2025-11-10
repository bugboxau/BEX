/*
* src/server.js
*
* This file sets up an express server that exposes a POST endpoint /api/ask-bot to send messages to the OpenAI API
* and return the AI tutor's response, enabling local development testing. 
*/
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/ask-bot", async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("[ask-bot] error", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
