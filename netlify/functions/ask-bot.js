/*
* netlify/functions/ask-bot.js
*
* This file implements a Netlify serverless function that handles POST request to send message to the OpenAI
* API and return the AI tutor's reponse, enabling deployment without a traditional server. 
*
* Saved for it we ever need to return to Netlify. 
*/
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handler(event) {
  try {
    const { messages } = JSON.parse(event.body || "{}");

    console.log("[ask-bot] received", messages?.length || 0, "messages");
    console.log("[ask-bot] last preview:",
      messages?.at?.(-1)?.content?.slice?.(0, 120) || "(none)"
    );

    if (!Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "No messages provided" }) };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "";
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })    // ✅ consistent shape
    };
  } catch (err) {
    console.error("[ask-bot] error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
