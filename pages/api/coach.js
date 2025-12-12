export default async function handler(req, res) {
  // Only allow POST requests (sending a message)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  const GEMINI_KEY = process.env.GEMINI_KEY;

  // 1. Check if the AI Key is set in Vercel
  if (!GEMINI_KEY) {
    return res.status(200).json({ 
      reply: "SYSTEM ERROR: Gemini API Key is missing in Vercel Settings. Please add 'GEMINI_KEY'." 
    });
  }

  // 2. The "Brain" Instructions
  const context = `
    You are ABRØNIX, an elite competitive Fortnite coach.
    
    CRITICAL CONTEXT:
    - You do not have access to live databases. 
    - The user enters their stats manually into the dashboard.
    - If they ask for specific stat analysis, ask them to provide their current K/D or Placement.
    
    ADVICE STYLE:
    - Short, punchy, aggressive (Pro Esports Coach persona).
    - Focus on: Piece Control, Deadside Rotations, Surge, and Mental.
    - If asked for practice, suggest: Raider464 Mechanics, Pandvil Boxfights, or Kovaaks.
    
    User Message: ${message}
  `;

  try {
    // 3. Send to Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
    });

    const data = await response.json();

    // 4. Handle Response
    if (!data.candidates || data.candidates.length === 0) {
      return res.status(200).json({ reply: "I couldn't process that. Ask about specific gameplay tactics." });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Neural Link Offline (Server Error)." });
  }
}
