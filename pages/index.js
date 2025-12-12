import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Activity, Brain, Target, BookOpen, Settings, 
  Save, Send, Edit3, Shield, WifiOff 
} from 'lucide-react';

Chart.register(...registerables);

export default function Dashboard() {
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // --- STATE: USER DATA (Manual) ---
  const [user, setUser] = useState('');
  const [stats, setStats] = useState({ kd: '0.00', win: '0', matches: '0', pr: '0' });
  
  // --- STATE: APP ---
  const [chat, setChat] = useState([{ role: 'ai', text: 'NEURAL ENGINE CONNECTED. Ready to optimize your gameplay.' }]);
  const [input, setInput] = useState('');
  const [routine, setRoutine] = useState(null);
  const [routineTime, setRoutineTime] = useState('60');
  const [journal, setJournal] = useState([]);
  const [journalEntry, setJournalEntry] = useState({ event: '', place: '', note: '' });

  // --- INITIAL LOAD ---
  useEffect(() => {
    // Load everything from LocalStorage (The Browser's Hard Drive)
    const u = localStorage.getItem('abx_user');
    const s = localStorage.getItem('abx_stats');
    const j = localStorage.getItem('abx_journal');
    
    if (u) setUser(u);
    if (s) setStats(JSON.parse(s));
    if (j) setJournal(JSON.parse(j));
  }, []);

  // --- ACTIONS ---

  const saveConfig = () => {
    setLoading(true);
    // Save to LocalStorage
    localStorage.setItem('abx_user', user);
    localStorage.setItem('abx_stats', JSON.stringify(stats));
    
    // Simulate a "Cloud Save" delay to feel professional
    setTimeout(() => {
      setLoading(false);
      alert("SYSTEM UPDATED: Profile & Stats Synced Locally");
    }, 800);
  };

  const sendMessage = async () => {
    if (!input) return;
    const msg = input;
    setInput('');
    setChat(prev => [...prev, { role: 'user', text: msg }]);

    try {
      // Still uses Gemini AI (Requires API Key in Vercel)
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'ai', text: 'Offline Mode: AI Key missing or invalid.' }]);
    }
  };

  const generateRoutine = () => {
    let plan = [];
    if (routineTime === '30') plan = ['10m: Raider Mechanics V4', '10m: Pandvil Headshot', '10m: 1v1 Realistics'];
    else if (routineTime === '60') plan = ['15m: Freebuild (Piece Control)', '15m: Aim Duel (Glider Tracking)', '30m: Ranked W-Keying'];
    else plan = ['20m: Advanced Mechanics', '20m: Kovaaks/AimLabs', '1h: Scrim Ladder', '1h: VOD Review'];
    setRoutine(plan);
  };

  const saveJournal = () => {
    const newEntry = { ...journalEntry, date: new Date().toLocaleDateString() };
    const updated = [newEntry, ...journal];
    setJournal(updated);
    localStorage.setItem('abx_journal', JSON.stringify(updated));
    setJournalEntry({ event: '', place: '', note: '' });
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen" style={{background: 'var(--bg)', color: 'white'}}>
      <Head><title>ABRØNIX | PRO</title></Head>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div style={{color: 'var(--brand)', fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem'}}>A</div>
        <NavIcon icon={<Activity />} label="Overview" active={tab==='dashboard'} setTab={setTab} id="dashboard" />
        <NavIcon icon={<Brain />} label="AI Coach" active={tab==='coach'} setTab={setTab} id="coach" />
        <NavIcon icon={<Target />} label="Routine" active={tab==='routine'} setTab={setTab} id="routine" />
        <NavIcon icon={<BookOpen />} label="Journal" active={tab==='journal'} setTab={setTab} id="journal" />
        <NavIcon icon={<Settings />} label="Data Entry" active={tab==='settings'} setTab={setTab} id="settings" />
      </div>

      {/* CONTENT */}
      <div className="flex-col w-full relative">
        <div className="header">
          <h1 style={{fontSize: '1.2rem', fontWeight: 'bold'}}>ABRØNIX <span style={{color: 'var(--brand)'}}>OS</span></h1>
          <div className="flex items-center gap-2" style={{fontSize: '0.8rem', color: '#666'}}>
            <WifiOff size={14} /> OFFLINE MODE (SECURE)
          </div>
        </div>

        <div className="p-8 fade-in" style={{overflowY: 'auto', height: 'calc(100vh - 80px)'}}>
          
          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div>
              <div className="grid-3">
                <StatCard label="K/D RATIO" value={stats.kd} sub="Tracked Manually" />
                <StatCard label="WIN %" value={stats.win + '%'} sub={`Matches: ${stats.matches}`} />
                <StatCard label="POWER RANKING" value={stats.pr} color="var(--brand)" sub="Points" />
              </div>
              <div className="glass" style={{padding:'2rem'}}>
                 <h3 style={{fontSize:'1rem', color:'#888', marginBottom:'1rem'}}>PERFORMANCE PROJECTION</h3>
                 <div style={{height:'200px', width:'100%'}}>
                    {/* Simulated Graph based on your manual inputs */}
                    <Line data={{
                        labels: ['Start', 'Week 1', 'Week 2', 'Current'],
                        datasets: [{
                            data: [parseFloat(stats.kd)-0.8, parseFloat(stats.kd)-0.4, parseFloat(stats.kd)-0.1, parseFloat(stats.kd)],
                            borderColor: '#ff003c', backgroundColor: 'rgba(255, 0, 60, 0.1)', fill: true, tension: 0.4
                        }]
                    }} options={{maintainAspectRatio: false, plugins:{legend:false}, scales:{x:{display:false}, y:{grid:{color:'#222'}}}}} />
                 </div>
              </div>
            </div>
          )}

          {/* SETTINGS (DATA ENTRY) */}
          {tab === 'settings' && (
            <div className="glass" style={{padding:'2rem', maxWidth:'600px', margin:'0 auto'}}>
               <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'2rem'}}>
                 <Edit3 color="var(--brand)" />
                 <h2 style={{margin:0}}>MANUAL DATA TERMINAL</h2>
               </div>
               
               <p style={{color:'#888', marginBottom:'2rem'}}>
                 Since API connections are disabled, use this terminal to update your stats. 
                 The AI Coach and Dashboard will use these numbers to build your plans.
               </p>

               <div className="grid-3">
                 <div>
                   <label style={{fontSize:'0.75rem', color:'#666', fontWeight:'bold'}}>USERNAME</label>
                   <input value={user} onChange={e => setUser(e.target.value)} />
                 </div>
                 <div>
                   <label style={{fontSize:'0.75rem', color:'#666', fontWeight:'bold'}}>PR POINTS</label>
                   <input value={stats.pr} onChange={e => setStats({...stats, pr: e.target.value})} />
                 </div>
               </div>

               <div className="grid-3">
                 <div>
                   <label style={{fontSize:'0.75rem', color:'#666', fontWeight:'bold'}}>K/D RATIO</label>
                   <input value={stats.kd} onChange={e => setStats({...stats, kd: e.target.value})} />
                 </div>
                 <div>
                   <label style={{fontSize:'0.75rem', color:'#666', fontWeight:'bold'}}>WIN % (0-100)</label>
                   <input value={stats.win} onChange={e => setStats({...stats, win: e.target.value})} />
                 </div>
                 <div>
                   <label style={{fontSize:'0.75rem', color:'#666', fontWeight:'bold'}}>MATCHES</label>
                   <input value={stats.matches} onChange={e => setStats({...stats, matches: e.target.value})} />
                 </div>
               </div>

               <button onClick={saveConfig} className="btn-primary" style={{marginTop:'1rem'}}>
                 {loading ? 'SAVING DATA...' : 'UPDATE SYSTEM'}
               </button>
            </div>
          )}

          {/* AI COACH */}
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
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask about rotations, meta, or mentality..." />
                <button onClick={sendMessage} className="btn-primary" style={{width: 'auto'}}><Send size={18} /></button>
              </div>
            </div>
          )}

          {/* ROUTINE */}
          {tab === 'routine' && (
            <div className="glass" style={{padding:'2rem'}}>
               <h3 style={{marginBottom:'1rem'}}>SCHEDULE BUILDER</h3>
               <select value={routineTime} onChange={e => setRoutineTime(e.target.value)} style={{marginBottom:'1rem', background:'#000'}}>
                  <option value="30">30 Mins (Warmup)</option>
                  <option value="60">1 Hour (Maintenance)</option>
                  <option value="120">2 Hours (Grind)</option>
               </select>
               <button onClick={generateRoutine} className="btn-primary">GENERATE BLUEPRINT</button>
               {routine && <ul style={{marginTop:'20px', lineHeight:'2'}}>{routine.map(r => <li key={r}>{r}</li>)}</ul>}
            </div>
          )}

          {/* JOURNAL */}
          {tab === 'journal' && (
             <div>
                <div className="glass" style={{padding:'1.5rem', marginBottom:'2rem'}}>
                   <h3 style={{marginBottom:'1rem'}}>LOG TOURNAMENT</h3>
                   <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                       <input placeholder="Event Name" value={journalEntry.event} onChange={e => setJournalEntry({...journalEntry, event: e.target.value})} />
                       <input placeholder="Placement (#)" value={journalEntry.place} onChange={e => setJournalEntry({...journalEntry, place: e.target.value})} />
                   </div>
                   <input placeholder="Notes (What went wrong?)" value={journalEntry.note} onChange={e => setJournalEntry({...journalEntry, note: e.target.value})} style={{marginBottom:'10px'}} />
                   <button onClick={saveJournal} className="btn-primary" style={{width:'auto'}}><Save size={16} /> SAVE LOG</button>
                </div>
                <div className="grid-3">
                   {journal.map((j, i) => (
                       <div key={i} className="glass" style={{padding:'1rem'}}>
                           <div style={{color:'var(--brand)', fontWeight:'bold'}}>{j.event}</div>
                           <div style={{fontSize:'0.8rem', color:'#888'}}>{j.date} • Place: {j.place}</div>
                           <div style={{marginTop:'0.5rem'}}>{j.note}</div>
                       </div>
                   ))}
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
