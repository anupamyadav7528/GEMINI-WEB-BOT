import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. CORS Headers set karein taaki frontend bina kisi dikkat ke connect ho sake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Pre-flight requests (OPTIONS) ko handle karein
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Sirf POST request allow karein
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Frontend se bheja gaya message nikalein
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // 2. Vercel dashboard se Environment Variable (GEMINI_API_KEY) uthayein
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // 3. Gemini model ko call karein aur content generate karein
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
        });

        // Response validation aur output return
        if (response && response.text) {
            return res.status(200).json({ reply: response.text });
        } else {
            throw new Error("Empty text received from Gemini Engine");
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ 
            error: "Gemini Engine Failed", 
            details: error.message 
        });
    }
}