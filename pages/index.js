import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Trophy, Target, Brain, Activity, Send, Settings, 
  Crosshair, BookOpen, AlertTriangle, Save 
} from 'lucide-react';

Chart.register(...registerables);

export default function Dashboard() {
  const [tab, setTab] = useState('dashboard');
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [stats, setStats] = useState({ kd: '--', win: '--', matches: '--', level: '--' });
  const [chat, setChat] = useState([{ role: 'ai', text: 'SNAPIN AI ONLINE. I have analyzed the Chapter 5 meta. How can I help?' }]);
  const [input, setInput] = useState('');
  const [routine, setRoutine] = useState(null);
  const [journal, setJournal] = useState([]);
  
  // Inputs
  const [routineTime, setRoutineTime] = useState('60');
  const [routineFocus, setRoutineFocus] = useState('mech');
  const [journalEntry, setJournalEntry] = useState({ event: '', placement: '', note: '' });

  // Load User on Start
  useEffect(() => {
    const saved = localStorage.getItem('abronix_user');
    const savedJournal = localStorage.getItem('abronix_journal');
    if (saved) setUser(saved);
    if (savedJournal) setJournal(JSON.parse(savedJournal));
  }, []);

  // --- ACTIONS ---

  const saveUser = () => {
    localStorage.setItem('abronix_user', user);
    alert('Profile Saved: ' + user);
  };

  const fetchStats = async () => {
    if (!user) return alert("Please enter username in Settings tab");
    setLoading(true);

    try {
      // Calls your Vercel Backend (pages/api/stats.js)
      const res = await fetch(`/api/stats?username=${user}`);
      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        setStats({
          kd: data.kd.toFixed(2),
          win: (data.winRate * 100).toFixed(1) + '%',
          matches: data.matches,
          level: data.level || 'Unknown'
        });
      }
    } catch (e) {
      // Fallback for demo if API key isn't set yet
      console.log("API Fail, using simulation");
      setStats({ kd: '1.4 (Sim)', win: '8%', matches: '120', level: '240' });
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input) return;
    const msg = input;
    setInput('');
    setChat(prev => [...prev, { role: 'user', text: msg }]);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'ai', text: 'Error: Check Gemini Key in Vercel Settings.' }]);
    }
  };

  const generateRoutine = () => {
    // Logic to build a routine based on inputs
    let plan = [];
    if (routineTime === '30') {
      plan = ['10m: Raider Mechanics V4', '10m: Headshot Only Boxfights', '10m: 1v1 Realistics'];
    } else if (routineTime === '60') {
      plan = ['15m: Freebuild & Edit Course', '15m: Kovaaks/AimLabs', '30m: Ranked W-Keying'];
    } else {
      plan = ['20m: Mechanics', '20m: Aim Duel', '1h: Scrims / Tourneys', '1h: VOD Review'];
    }
    
    // Add focus specific
    if (routineFocus === 'aim') plan.unshift('**FOCUS:** Low Sens Tracking');
    if (routineFocus === 'iq') plan.push('**NOTE:** Watch 1 Pro VOD before playing');

    setRoutine(plan);
  };

  const addJournal = () => {
    const newEntry = { ...journalEntry, date: new Date().toLocaleDateString() };
    const updated = [newEntry, ...journal];
    setJournal(updated);
    localStorage.setItem('abronix_journal', JSON.stringify(updated));
    setJournalEntry({ event: '', placement: '', note: '' });
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen" style={{background: 'var(--bg)', color: 'white'}}>
      <Head><title>ABRØNIX | PRO</title></Head>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div style={{color: 'var(--brand)', fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem'}}>A</div>
        
        <NavIcon icon={<Activity />} label="Dashboard" active={tab==='dashboard'} setTab={setTab} id="dashboard" />
        <NavIcon icon={<Brain />} label="AI Coach" active={tab==='coach'} setTab={setTab} id="coach" />
        <NavIcon icon={<Target />} label="Routine Gen" active={tab==='routine'} setTab={setTab} id="routine" />
        <NavIcon icon={<BookOpen />} label="Journal" active={tab==='journal'} setTab={setTab} id="journal" />
        <NavIcon icon={<Settings />} label="Settings" active={tab==='settings'} setTab={setTab} id="settings" />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-col w-full relative">
        {/* HEADER */}
        <div className="header">
          <h1 style={{fontSize: '1.2rem', fontWeight: 'bold'}}>ABRØNIX <span style={{color: 'var(--brand)'}}>PRO</span></h1>
          <div className="flex items-center gap-2" style={{fontSize: '0.8rem', color: '#666'}}>
            <div style={{width: 8, height: 8, background: '#00ff00', borderRadius: '50%', boxShadow: '0 0 10px #00ff00'}}></div>
            {user ? user.toUpperCase() : 'GUEST'}
          </div>
        </div>

        <div className="p-8 fade-in" style={{overflowY: 'auto', height: 'calc(100vh - 80px)'}}>
          
          {/* --- DASHBOARD --- */}
          {tab === 'dashboard' && (
            <div>
              <div className="grid-3">
                <StatCard label="K/D RATIO" value={stats.kd} sub="Target: 3.0+" />
                <StatCard label="WIN RATE" value={stats.win} sub={`Matches: ${stats.matches}`} />
                <StatCard label="ACCOUNT LEVEL" value={stats.level} color="var(--brand)" sub="Season Progress" />
              </div>
              <div className="glass" style={{padding: '2rem', display: 'flex', flexDirection:'column', gap:'1rem'}}>
                 <h3 style={{fontSize:'1rem', color:'#888'}}>WEEKLY PROGRESS</h3>
                 <div style={{height:'200px', width:'100%'}}>
                    <Line data={{
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Eliminations',
                            data: [12, 19, 15, 25, 22, 30, 45],
                            borderColor: '#ff003c',
                            backgroundColor: 'rgba(255, 0, 60, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    }} options={{maintainAspectRatio: false, plugins:{legend:false}, scales:{x:{display:false}, y:{grid:{color:'#222'}}}}} />
                 </div>
              </div>
              <button onClick={fetchStats} className="btn-primary" style={{marginTop: '20px', width: 'auto'}}>
                {loading ? 'LOADING...' : 'REFRESH STATS'}
              </button>
            </div>
          )}

          {/* --- AI COACH --- */}
          {tab === 'coach' && (
            <div className="glass" style={{height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
              <div style={{flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {chat.map((c, i) => (
                  <div key={i} style={{
                    padding: '1rem', borderRadius: '8px', maxWidth: '80%', 
                    background: c.role === 'ai' ? '#111' : 'var(--brand)',
                    alignSelf: c.role === 'ai' ? 'flex-start' : 'flex-end',
                    borderLeft: c.role === 'ai' ? '3px solid var(--brand)' : 'none'
                  }}>
                    {c.text}
                  </div>
                ))}
              </div>
              <div style={{padding: '1rem', borderTop: '1px solid var(--border)', background: '#000', display: 'flex', gap: '10px'}}>
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask about rotations, aim, or mental..." />
                <button onClick={sendMessage} className="btn-primary" style={{width: 'auto'}}><Send size={18} /></button>
              </div>
            </div>
          )}

          {/* --- ROUTINE GENERATOR --- */}
          {tab === 'routine' && (
            <div className="grid-3">
               <div className="glass" style={{padding:'2rem'}}>
                  <h3 style={{marginBottom:'1rem'}}>CONFIGURATOR</h3>
                  <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.8rem', color:'#888'}}>TIME AVAILABLE</label>
                  <select value={routineTime} onChange={e => setRoutineTime(e.target.value)} style={{background:'#000', color:'white', border:'1px solid #333', padding:'10px', width:'100%', marginBottom:'1rem'}}>
                      <option value="30">30 Minutes (Warmup)</option>
                      <option value="60">1 Hour (Standard)</option>
                      <option value="120">2+ Hours (Grind)</option>
                  </select>

                  <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.8rem', color:'#888'}}>MAIN WEAKNESS</label>
                  <select value={routineFocus} onChange={e => setRoutineFocus(e.target.value)} style={{background:'#000', color:'white', border:'1px solid #333', padding:'10px', width:'100%', marginBottom:'1rem'}}>
                      <option value="mech">Mechanics / Building</option>
                      <option value="aim">Aim / Tracking</option>
                      <option value="iq">Game Sense / IQ</option>
                  </select>
                  <button onClick={generateRoutine} className="btn-primary">GENERATE BLUEPRINT</button>
               </div>

               <div className="glass" style={{padding:'2rem', gridColumn: 'span 2'}}>
                  <h3 style={{marginBottom:'1rem', color:'var(--brand)'}}>YOUR CUSTOM PLAN</h3>
                  {routine ? (
                    <ul style={{lineHeight:'2', color:'#ccc'}}>
                        {routine.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <div style={{color:'#666', fontStyle:'italic'}}>Select options and click Generate...</div>
                  )}
               </div>
            </div>
          )}

          {/* --- JOURNAL --- */}
          {tab === 'journal' && (
            <div>
               <div className="glass" style={{padding:'1.5rem', marginBottom:'2rem'}}>
                  <h3 style={{marginBottom:'1rem'}}>LOG MATCH</h3>
                  <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                      <input placeholder="Event (e.g. Solo Cup)" value={journalEntry.event} onChange={e => setJournalEntry({...journalEntry, event: e.target.value})} />
                      <input placeholder="Placement/Pts" value={journalEntry.placement} onChange={e => setJournalEntry({...journalEntry, placement: e.target.value})} />
                  </div>
                  <input placeholder="Why did you die? (Note)" value={journalEntry.note} onChange={e => setJournalEntry({...journalEntry, note: e.target.value})} style={{marginBottom:'10px'}} />
                  <button onClick={addJournal} className="btn-primary" style={{width:'auto'}}><Save size={16} /> SAVE ENTRY</button>
               </div>

               <div className="grid-3">
                  {journal.map((j, i) => (
                      <div key={i} className="glass" style={{padding:'1rem'}}>
                          <div style={{color:'var(--brand)', fontWeight:'bold'}}>{j.event}</div>
                          <div style={{fontSize:'0.8rem', color:'#888'}}>{j.date} • {j.placement}</div>
                          <div style={{marginTop:'0.5rem'}}>{j.note}</div>
                      </div>
                  ))}
               </div>
            </div>
          )}

           {/* --- SETTINGS --- */}
           {tab === 'settings' && (
            <div className="glass" style={{maxWidth: '500px', margin: '0 auto', padding: '2rem'}}>
              <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>SYSTEM CONFIG</h2>
              
              <label style={{display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem'}}>FORTNITE USERNAME</label>
              <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Epic Games ID" style={{marginBottom: '1rem'}} />
              
              <button onClick={saveUser} className="btn-primary">SAVE PROFILE</button>
              
              <div style={{marginTop:'2rem', paddingTop:'1rem', borderTop:'1px solid #333', fontSize:'0.8rem', color:'#666'}}>
                  <p>API Keys must be set in Vercel Environment Variables:</p>
                  <ul style={{listStyle:'disc', paddingLeft:'20px'}}>
                      <li>FN_API_KEY</li>
                      <li>GEMINI_KEY</li>
                  </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---
function NavIcon({ icon, label, active, setTab, id }) {
  return (
    <div className={`nav-item ${active?'active':''}`} onClick={() => setTab(id)}>
      {icon} <span>{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="glass" style={{padding: '1.5rem'}}>
      <div style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#888', letterSpacing: '1px', marginBottom: '0.5rem'}}>{label}</div>
      <div style={{fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: color || 'white'}}>{value}</div>
      <div style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>{sub}</div>
    </div>
  );
}
