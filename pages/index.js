// ... imports remain the same

export default function Dashboard() {
  // ... state variables remain the same
  const [user, setUser] = useState(''); // User types their name here

  // --- 1. FETCH STATS (Calls your secure /api/stats endpoint) ---
  const fetchStats = async () => {
    if(!user) return alert("Enter a username first");
    setLoading(true);

    try {
      // We call OUR server, not Fortnite directly.
      const res = await fetch(`/api/stats?username=${user}`);
      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        setStats({
          kd: data.kd.toFixed(2),
          win: (data.winRate * 100).toFixed(1) + '%',
          matches: data.matches
        });
        // After getting stats, try to load their cloud data too
        loadCloudData();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // --- 2. CLOUD SAVE (Calls your secure /api/db endpoint) ---
  const saveToCloud = async () => {
    if(!user) return;
    
    const payload = {
      chatHistory: chat,
      lastStats: stats,
      preferences: { theme: 'red' }
    };

    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, data: payload })
    });
    alert("Profile Saved to Cloud!");
  };

  // --- 3. CLOUD LOAD ---
  const loadCloudData = async () => {
    const res = await fetch(`/api/db?username=${user}`);
    const data = await res.json();
    if(data.chatHistory) setChat(data.chatHistory);
  };

  // ... The rest of your JSX (HTML) remains the same
  // Just make sure the inputs/buttons call these new functions.
}
