// This runs on the Server (Node.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  const GEMINI_KEY = process.env.GEMINI_KEY; // Securely pulled from Vercel Settings

  const context = `
    You are Snapin/ABRØNIX, the world's most advanced Fortnite AI Coach.
    Your tone is: Professional, Direct, Elite.
    Advice logic:
    - If user asks about aim: Suggest Kovaaks + In-game tracking maps.
    - If user asks about rotations: Discuss Deadside, Layering, and Surge.
    - If user asks about mental: Discuss tilt management and VOD review.
    User Question: ${message}
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "Neural Link Offline. Check API Key." });
  }
}
