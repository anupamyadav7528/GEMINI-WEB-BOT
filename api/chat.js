import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. Manage CORS Headers correctly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // 2. Validate Request Body
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    // 3. Check for API Key Before Running SDK
    if (!process.env.GEMINI_API_KEY) {
        console.error("Missing Environment Variable: GEMINI_API_KEY");
        return res.status(500).json({ error: "Server Configuration Error: Missing API Key" });
    }

    try {
        // Correct initialization instance according to the standard SDK
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Target model execution
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: message,
        });

        // Safe extraction of response text
        if (response && response.text) {
            return res.status(200).json({ reply: response.text });
        } else {
            throw new Error("No readable text structure returned from Gemini");
        }

    } catch (error) {
        console.error("Runtime Gemini API Error Details:", error);
        return res.status(500).json({ 
            error: "Gemini Engine Failed", 
            details: error.message 
        });
    }
}