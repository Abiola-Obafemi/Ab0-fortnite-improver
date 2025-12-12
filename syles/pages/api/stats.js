export default async function handler(req, res) {
  // 1. Get the username sent from the frontend
  const { username } = req.query;

  if (!username) return res.status(400).json({ error: 'Username required' });

  // 2. Get the Secret Key from Vercel Vault
  const API_KEY = process.env.FN_API_KEY;

  try {
    // 3. Lookup User ID
    const lookupReq = await fetch(`https://fortniteapi.io/v1/lookup?username=${username}`, {
      headers: { 'Authorization': API_KEY }
    });
    const lookup = await lookupReq.json();

    if (!lookup.result) throw new Error('Player not found');

    // 4. Get Stats
    const statsReq = await fetch(`https://fortniteapi.io/v1/stats?account=${lookup.account_id}`, {
      headers: { 'Authorization': API_KEY }
    });
    const stats = await statsReq.json();

    // 5. Send only the necessary data to the frontend
    // (We don't send the API key, just the K/D and Wins)
    const solo = stats.global_stats.solo;
    res.status(200).json({
      kd: solo.kd,
      winRate: solo.winrate,
      matches: solo.matchesplayed
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
