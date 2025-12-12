import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Trophy, Target, Brain, Activity, Send, Settings, User } from 'lucide-react';

Chart.register(...registerables);

export default function Dashboard() {
  const [tab, setTab] = useState('dashboard');
  const [user, setUser] = useState('');
  const [stats, setStats] = useState({ kd: '--', win: '--', matches: '--' });
  const [chat, setChat] = useState([{ role: 'ai', text: 'SYSTEM ONLINE. Ready to analyze.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---
  const fetchStats = async () => {
    // In a full build, this would also use a backend API to hide the FN key
    // For this demo, we assume the user sets their name
    alert("Simulating Stat Fetch for " + user);
    setStats({ kd: '3.42', win: '12.5%', matches: '420' }); // Simulated for demo
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
    <div className="flex h-screen w-screen bg-[--bg] text-white overflow-hidden">
      <Head>
        <title>ABRØNIX | PRO OS</title>
      </Head>

      {/* SIDEBAR */}
      <div className="w-20 hover:w-64 transition-all duration-300 border-r border-[--border] flex flex-col items-center py-6 glass z-50">
        <div className="text-[--brand] font-black text-2xl mb-8">A</div>
        
        <NavIcon icon={<Activity />} label="Overview" active={tab==='dashboard'} onClick={() => setTab('dashboard')} />
        <NavIcon icon={<Brain />} label="Neural Coach" active={tab==='coach'} onClick={() => setTab('coach')} />
        <NavIcon icon={<Target />} label="Routine Gen" active={tab==='routine'} onClick={() => setTab('routine')} />
        <NavIcon icon={<Settings />} label="Settings" active={tab==='settings'} onClick={() => setTab('settings')} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative">
        {/* HEADER */}
        <div className="h-20 border-b border-[--border] flex items-center justify-between px-8 glass">
          <h1 className="font-bold text-xl tracking-widest">ABRØNIX <span className="text-[--brand]">PRO</span></h1>
          <div className="flex items-center gap-2 text-sm text-[--text-dim]">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00]"></div>
            ONLINE
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          
          {/* DASHBOARD PAGE */}
          {tab === 'dashboard' && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="SEASON K/D" value={stats.kd} sub="Top 4% (Good)" />
                <StatCard label="WIN RATE" value={stats.win} sub="Matches: 840" />
                <StatCard label="MAIN WEAKNESS" value="OFF-SPAWN" color="text-[--brand]" sub="Detected by AI" />
              </div>
              <div className="glass p-6 rounded-xl h-64 flex items-center justify-center border border-[--border]">
                 <div className="text-[--text-dim]">PERFORMANCE GRAPH VISUALIZER (ACTIVE)</div>
              </div>
            </div>
          )}

          {/* AI COACH PAGE */}
          {tab === 'coach' && (
            <div className="h-full flex flex-col glass rounded-xl border border-[--border] overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chat.map((c, i) => (
                  <div key={i} className={`p-4 rounded-lg max-w-[80%] ${c.role === 'ai' ? 'bg-[#111] border-l-2 border-[--brand]' : 'bg-[--brand] ml-auto'}`}>
                    {c.text}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-[--border] flex gap-2 bg-black">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about competitive strategy..." 
                  className="bg-transparent border-none focus:ring-0"
                />
                <button onClick={sendMessage} className="bg-[--brand] p-2 rounded hover:opacity-80"><Send size={18} /></button>
              </div>
            </div>
          )}

           {/* SETTINGS PAGE */}
           {tab === 'settings' && (
            <div className="max-w-lg mx-auto glass p-8 rounded-xl border border-[--border]">
              <h2 className="text-xl font-bold mb-6">SYSTEM CONFIG</h2>
              <p className="text-sm text-gray-500 mb-4">API Keys are handled via Vercel Environment Variables for security.</p>
              
              <label className="block text-xs text-gray-400 mb-2">FORTNITE USERNAME</label>
              <input 
                value={user} 
                onChange={(e) => setUser(e.target.value)}
                placeholder="Epic Games ID" 
                className="mb-4"
              />
              <button onClick={() => alert('Saved to Local Session')} className="btn-primary w-full">SAVE PROFILE</button>
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
    <div onClick={onClick} className={`w-full p-4 flex gap-4 cursor-pointer transition-colors ${active ? 'text-white bg-white/5 border-l-2 border-[--brand]' : 'text-gray-500 hover:text-white'}`}>
      <div>{icon}</div>
      <span className="whitespace-nowrap font-bold text-sm">{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="glass p-6 rounded-xl border border-[--border]">
      <div className="text-xs font-bold text-gray-500 tracking-wider mb-2">{label}</div>
      <div className={`text-4xl font-mono font-bold ${color || 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-2">{sub}</div>
    </div>
  );
        }
