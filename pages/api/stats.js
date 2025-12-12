export default async function handler(req, res) {
  const { username } = req.query;

  // 1. Check if username exists
  if (!username) return res.status(400).json({ error: 'Username required' });

  // 2. Check if API Key exists in Vercel
  const API_KEY = process.env.FN_API_KEY;
  if (!API_KEY) {
    // If no key, return dummy data for testing instead of crashing
    return res.status(200).json({ kd: 0, winRate: 0, matches: 0, level: 0, error: 'API Key Missing in Vercel' });
  }

  try {
    // 3. Lookup ID
    const lookupReq = await fetch(`https://fortniteapi.io/v1/lookup?username=${username}`, {
      headers: { 'Authorization': API_KEY }
    });
    const lookup = await lookupReq.json();

    if (!lookup.result) return res.status(404).json({ error: 'Player not found' });

    // 4. Get Stats
    const statsReq = await fetch(`https://fortniteapi.io/v1/stats?account=${lookup.account_id}`, {
      headers: { 'Authorization': API_KEY }
    });
    const stats = await statsReq.json();

    // 5. Return Data
    const solo = stats.global_stats.solo;
    res.status(200).json({
      kd: solo.kd,
      winRate: solo.winrate,
      matches: solo.matchesplayed,
      level: stats.account.level
    });

  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
}
