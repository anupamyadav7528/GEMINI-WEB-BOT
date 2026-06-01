import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        // Vercel Environment Variable se key uthayega
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
        });

        if (response && response.text) {
            return res.status(200).json({ reply: response.text });
        } else {
            throw new Error("Empty text from Gemini");
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ error: "Gemini Engine Failed", details: error.message });
    }
}