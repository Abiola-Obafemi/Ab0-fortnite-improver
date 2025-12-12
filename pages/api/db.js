export default async function handler(req, res) {
  const { username, data } = req.body;
  const DB_URL = process.env.DB_URL; // Hidden URL

  // Create a clean ID from the username
  const userId = username.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const endpoint = `${DB_URL}/users/${userId}.json`;

  if (req.method === 'POST') {
    // --- SAVE DATA ---
    await fetch(endpoint, {
      method: 'PUT', // Overwrite/Update
      body: JSON.stringify(data)
    });
    res.status(200).json({ success: true });

  } else if (req.method === 'GET') {
    // --- LOAD DATA ---
    // If getting, we need the username from query, not body
    const targetUser = req.query.username.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const loadUrl = `${DB_URL}/users/${targetUser}.json`;
    
    const response = await fetch(loadUrl);
    const json = await response.json();
    res.status(200).json(json || {});
    
  } else {
    res.status(405).end();
  }
}
