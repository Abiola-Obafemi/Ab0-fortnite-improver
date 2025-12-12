export default async function handler(req, res) {
  const DB_URL = process.env.DB_URL; // Gets hidden URL from Vercel

  if (!DB_URL) {
    return res.status(500).json({ error: "Database URL missing in Vercel Settings" });
  }

  // 1. LOAD DATA (GET Request)
  if (req.method === 'GET') {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Username required" });

    // Sanitize username for Firebase (remove . $ # [ ])
    const safeUser = username.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    try {
      const response = await fetch(`${DB_URL}/users/${safeUser}.json`);
      const data = await response.json();
      return res.status(200).json(data || {}); 
    } catch (e) {
      return res.status(500).json({ error: "Failed to load from Cloud" });
    }
  }

  // 2. SAVE DATA (POST Request)
  if (req.method === 'POST') {
    const { username, data } = req.body;
    if (!username || !data) return res.status(400).json({ error: "Missing data" });

    const safeUser = username.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    try {
      await fetch(`${DB_URL}/users/${safeUser}.json`, {
        method: 'PUT', // PUT replaces the old data with new data
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: "Failed to save to Cloud" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
