import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // CORS Headers
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

    try {
        // Yahan sahi configuration initialization hai
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Sahi method calling: generateContent ke andar seedhe contents pass hota hai
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: message }] }]
        });

        // Gemini response validation text extraction
        const replyText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.status(200).json({ reply: replyText });
        } else {
            throw new Error("Gemini response format structure mismatched");
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ 
            error: "Gemini Engine Failed", 
            details: error.message 
        });
    }
}