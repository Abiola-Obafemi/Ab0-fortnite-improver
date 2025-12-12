// --- THIS WAS MISSING ---
import { useState, useEffect } from 'react'; 
// ------------------------

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

  // Fix for Vercel Build (Prevents localStorage crash on server)
  useEffect(() => {
    const savedUser = localStorage.getItem('abronix_user');
    if (savedUser) setUser(savedUser);
  }, []);

  const saveUser = () => {
    localStorage.setItem('abronix_user', user);
    alert('User Saved: ' + user);
  };

  // --- ACTIONS ---
  const fetchStats = async () => {
    if (!user) return alert("Please enter username in Settings first");
    
    // Simulate API call (Replace with /api/stats call in production)
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
      setChat(prev => [...prev, { role: 'ai', text: 'Error connecting to server.' }]);
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen w-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Head>
        <title>ABRØNIX | PRO OS</title>
      </Head>

      {/* SIDEBAR */}
      <div className="w-20 hover:w-64 transition-all duration-300 border-r border-white/10 flex flex-col items-center py-6 bg-[#0a0a0a] z-50">
        <div className="text-[#ff003c] font-black text-2xl mb-8">A</div>
        
        <NavIcon icon={<Activity />} label="Overview" active={tab==='dashboard'} onClick={() => setTab('dashboard')} />
        <NavIcon icon={<Brain />} label="Neural Coach" active={tab==='coach'} onClick={() => setTab('coach')} />
        <NavIcon icon={<Target />} label="Routine Gen" active={tab==='routine'} onClick={() => setTab('routine')} />
        <NavIcon icon={<Settings />} label="Settings" active={tab==='settings'} onClick={() => setTab('settings')} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative">
        {/* HEADER */}
        <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]">
          <h1 className="font-bold text-xl tracking-widest">ABRØNIX <span className="text-[#ff003c]">PRO</span></h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00]"></div>
            ONLINE
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          
          {/* DASHBOARD PAGE */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="SEASON K/D" value={stats.kd} sub="Top 4% (Good)" />
                <StatCard label="WIN RATE" value={stats.win} sub={`Matches: ${stats.matches}`} />
                <StatCard label="MAIN WEAKNESS" value="OFF-SPAWN" color="text-[#ff003c]" sub="Detected by AI" />
              </div>
              <div className="bg-white/5 p-6 rounded-xl h-64 flex items-center justify-center border border-white/10">
                 <div className="text-gray-500">PERFORMANCE GRAPH VISUALIZER (ACTIVE)</div>
              </div>
              <button onClick={fetchStats} className="bg-[#ff003c] px-6 py-3 rounded font-bold hover:opacity-80 transition">REFRESH DATA</button>
            </div>
          )}

          {/* AI COACH PAGE */}
          {tab === 'coach' && (
            <div className="h-full flex flex-col bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chat.map((c, i) => (
                  <div key={i} className={`p-4 rounded-lg max-w-[80%] ${c.role === 'ai' ? 'bg-[#111] border-l-2 border-[#ff003c]' : 'bg-[#ff003c] ml-auto'}`}>
                    {c.text}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/10 flex gap-2 bg-black">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about competitive strategy..." 
                  className="flex-1 bg-transparent border border-white/10 p-2 rounded text-white focus:border-[#ff003c] outline-none"
                />
                <button onClick={sendMessage} className="bg-[#ff003c] p-2 rounded hover:opacity-80"><Send size={18} /></button>
              </div>
            </div>
          )}

           {/* SETTINGS PAGE */}
           {tab === 'settings' && (
            <div className="max-w-lg mx-auto bg-white/5 p-8 rounded-xl border border-white/10">
              <h2 className="text-xl font-bold mb-6">SYSTEM CONFIG</h2>
              <p className="text-sm text-gray-500 mb-4">API Keys are handled via Vercel Environment Variables for security.</p>
              
              <label className="block text-xs text-gray-400 mb-2">FORTNITE USERNAME</label>
              <input 
                value={user} 
                onChange={(e) => setUser(e.target.value)}
                placeholder="Epic Games ID" 
                className="w-full bg-black/50 border border-white/10 p-3 rounded mb-4 text-white focus:border-[#ff003c] outline-none"
              />
              <button onClick={saveUser} className="w-full bg-[#ff003c] py-3 rounded font-bold hover:opacity-80">SAVE PROFILE</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function NavIcon({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`w-full p-4 flex gap-4 cursor-pointer transition-colors ${active ? 'text-white bg-white/5 border-l-2 border-[#ff003c]' : 'text-gray-500 hover:text-white'}`}>
      <div>{icon}</div>
      <span className="whitespace-nowrap font-bold text-sm">{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-[#ff003c] transition">
      <div className="text-xs font-bold text-gray-500 tracking-wider mb-2">{label}</div>
      <div className={`text-4xl font-mono font-bold ${color || 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-2">{sub}</div>
    </div>
  );
}
