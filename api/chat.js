export default async function handler(req, res) {
    // CORS configuration
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

    const apiKey = process.env.GEMINI_API_KEY; // Isme hamari Groq key saved hai
    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing on Vercel." });
    }

    try {
        // Direct Groq API call bina kisi external package ke jhanjhat ke
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Groq ka super fast aur intelligent model
                messages: [{ role: "user", content: message }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Groq API Error");
        }

        const reply = data.choices[0].message.content;
        return res.status(200).json({ reply: reply });

    } catch (error) {
        console.error("Groq Error:", error);
        return res.status(500).json({ error: "Bot Engine Failed", details: error.message });
    }
}