import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY environment variable." });
    }

    try {
        const genAI = new GoogleGenAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        if (text) {
            return res.status(200).json({ reply: text });
        } else {
            throw new Error("Empty response from Gemini");
        }
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: "Gemini Engine Failed", details: error.message });
    }
}