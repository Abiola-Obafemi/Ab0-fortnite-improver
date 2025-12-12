import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Trophy, Target, Brain, Activity, Send, Settings } from 'lucide-react';

Chart.register(...registerables);

export default function Dashboard() {
  const [tab, setTab] = useState('dashboard');
  const [user, setUser] = useState('');
  const [stats, setStats] = useState({ kd: '--', win: '--', matches: '--' });
  const [chat, setChat] = useState([{ role: 'ai', text: 'SYSTEM ONLINE. Ready to analyze.' }]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('abronix_user');
    if (savedUser) setUser(savedUser);
  }, []);

  const saveUser = () => {
    localStorage.setItem('abronix_user', user);
    alert('User Saved: ' + user);
  };

  const fetchStats = async () => {
    if (!user) return alert("Please enter username in Settings first");
    // In production, this calls /api/stats
    setStats({ kd: '3.42', win: '12.5%', matches: '840' }); 
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
      setChat(prev => [...prev, { role: 'ai', text: 'Neural Link Offline (Check API Key)' }]);
    }
  };

  return (
    <div className="flex h-screen" style={{background: 'var(--bg)', color: 'white'}}>
      <Head>
        <title>ABRØNIX | PRO OS</title>
      </Head>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div style={{color: 'var(--brand)', fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem'}}>A</div>
        
        <div className={`nav-item ${tab==='dashboard'?'active':''}`} onClick={() => setTab('dashboard')}>
          <Activity size={20} /> <span>Overview</span>
        </div>
        <div className={`nav-item ${tab==='coach'?'active':''}`} onClick={() => setTab('coach')}>
          <Brain size={20} /> <span>Neural Coach</span>
        </div>
        <div className={`nav-item ${tab==='routine'?'active':''}`} onClick={() => setTab('routine')}>
          <Target size={20} /> <span>Routine Gen</span>
        </div>
        <div className={`nav-item ${tab==='settings'?'active':''}`} onClick={() => setTab('settings')}>
          <Settings size={20} /> <span>Settings</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-col w-full" style={{position: 'relative'}}>
        {/* HEADER */}
        <div className="header">
          <h1 style={{fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold'}}>
            ABRØNIX <span style={{color: 'var(--brand)'}}>PRO</span>
          </h1>
          <div className="flex items-center gap-2" style={{fontSize: '0.8rem', color: '#666'}}>
            <div style={{width: 8, height: 8, background: '#00ff00', borderRadius: '50%', boxShadow: '0 0 10px #00ff00'}}></div>
            ONLINE
          </div>
        </div>

        <div className="p-8 fade-in" style={{overflowY: 'auto', height: 'calc(100vh - 80px)'}}>
          
          {/* DASHBOARD PAGE */}
          {tab === 'dashboard' && (
            <div>
              <div className="grid-3">
                <StatCard label="SEASON K/D" value={stats.kd} sub="Top 4% (Good)" />
                <StatCard label="WIN RATE" value={stats.win} sub={`Matches: ${stats.matches}`} />
                <StatCard label="MAIN WEAKNESS" value="OFF-SPAWN" color="var(--brand)" sub="Detected by AI" />
              </div>
              <div className="glass" style={{height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                 <div style={{color: '#666'}}>PERFORMANCE GRAPH VISUALIZER (ACTIVE)</div>
              </div>
              <button onClick={fetchStats} className="btn-primary" style={{marginTop: '20px', width: 'auto'}}>REFRESH DATA</button>
            </div>
          )}

          {/* AI COACH PAGE */}
          {tab === 'coach' && (
            <div className="glass" style={{height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
              <div style={{flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {chat.map((c, i) => (
                  <div key={i} style={{
                    padding: '1rem', 
                    borderRadius: '8px', 
                    maxWidth: '80%', 
                    background: c.role === 'ai' ? '#111' : 'var(--brand)',
                    alignSelf: c.role === 'ai' ? 'flex-start' : 'flex-end',
                    borderLeft: c.role === 'ai' ? '3px solid var(--brand)' : 'none'
                  }}>
                    {c.text}
                  </div>
                ))}
              </div>
              <div style={{padding: '1rem', borderTop: '1px solid var(--border)', background: '#000', display: 'flex', gap: '10px'}}>
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about competitive strategy..." 
                />
                <button onClick={sendMessage} className="btn-primary" style={{width: 'auto'}}><Send size={18} /></button>
              </div>
            </div>
          )}

           {/* SETTINGS PAGE */}
           {tab === 'settings' && (
            <div className="glass" style={{maxWidth: '500px', margin: '0 auto', padding: '2rem'}}>
              <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>SYSTEM CONFIG</h2>
              <p style={{color: '#666', marginBottom: '1.5rem'}}>API Keys are handled via Vercel Environment Variables for security.</p>
              
              <label style={{display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem'}}>FORTNITE USERNAME</label>
              <input 
                value={user} 
                onChange={(e) => setUser(e.target.value)}
                placeholder="Epic Games ID" 
                style={{marginBottom: '1rem'}}
              />
              <button onClick={saveUser} className="btn-primary">SAVE PROFILE</button>
            </div>
          )}

        </div>
      </div>
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
