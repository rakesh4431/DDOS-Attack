import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Activity, 
  Zap, 
  Lock, 
  Server,
  Globe,
  RefreshCw,
  Cpu,
  Info,
  XCircle
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { TrafficStats, BlockedIP } from './types';

// Simulation Constants
const MAX_DATA_POINTS = 40;
const ATTACK_IP_POOL = ['45.33.22.11', '103.44.12.99', '185.12.4.55', '202.1.4.5', '77.88.99.10'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ml' | 'project'>('dashboard');
  const [isAttackActive, setIsAttackActive] = useState(false);
  const [stats, setStats] = useState<TrafficStats[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [toasts, setToasts] = useState<{id: number, ip: string}[]>([]);
  const [serverLoad, setServerLoad] = useState(12);
  
  const statsRef = useRef<TrafficStats[]>([]);
  const toastIdRef = useRef(0);

  // Initialize stats
  useEffect(() => {
    const initialStats = Array.from({ length: MAX_DATA_POINTS }).map((_, i) => ({
      timestamp: new Date(Date.now() - (MAX_DATA_POINTS - i) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      requests: 10 + Math.random() * 5,
      malicious: 0
    }));
    setStats(initialStats);
    statsRef.current = initialStats;
  }, []);

  // Traffic Simulation Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      let normalReq = 8 + Math.random() * 6;
      let maliciousReq = 0;

      if (isAttackActive) {
        maliciousReq = 40 + Math.random() * 20;
        
        // ML Detection Simulation
        const randomAttackIP = ATTACK_IP_POOL[Math.floor(Math.random() * ATTACK_IP_POOL.length)];
        if (!blockedIPs.find(b => b.ip === randomAttackIP) && Math.random() > 0.7) {
          const newBlock = {
            ip: randomAttackIP,
            reason: 'DDoS Pattern Detected',
            timestamp: Date.now()
          };
          setBlockedIPs(prev => [newBlock, ...prev].slice(0, 10));
          
          // Add toast
          const tid = toastIdRef.current++;
          setToasts(prev => [...prev, { id: tid, ip: randomAttackIP }]);
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== tid));
          }, 4000);
        }
      }

      const newStat = {
        timestamp: now,
        requests: normalReq + maliciousReq,
        malicious: maliciousReq
      };

      const updatedStats = [...statsRef.current.slice(1), newStat];
      statsRef.current = updatedStats;
      setStats(updatedStats);

      // Update Server Load slowly
      setServerLoad(prev => {
        if (isAttackActive) {
          return Math.min(100, prev + (Math.random() * 5 + 2));
        } else {
          return Math.max(12, prev - (Math.random() * 3 + 1));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAttackActive, blockedIPs]);

  const toggleAttack = () => setIsAttackActive(!isAttackActive);
  const resetSystem = () => {
    setBlockedIPs([]);
    setIsAttackActive(false);
    setServerLoad(12);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b-2 border-black px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black serif-heading tracking-tight">DDoS Shield ML</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60 mt-1">Real-time Detection & Prevention System</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleAttack}
            className={cn(
              "brutal-button px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2",
              isAttackActive ? "bg-red-500 text-white" : "bg-white text-red-500"
            )}
          >
            <Zap className="w-4 h-4" />
            {isAttackActive ? "Stop Attack Simulation" : "Start Attack Simulation"}
          </button>
          
          <button 
            className={cn(
              "brutal-button px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2",
              blockedIPs.length > 0 ? "bg-emerald-500 text-white" : "bg-white text-emerald-500"
            )}
          >
            <Shield className="w-4 h-4" />
            Prevention: {blockedIPs.length > 0 ? "Active" : "Monitoring"}
          </button>

          <button onClick={resetSystem} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex border-b-2 border-black bg-white/50">
        <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={Activity} label="Dashboard" />
        <TabButton active={activeTab === 'ml'} onClick={() => setActiveTab('ml')} icon={Cpu} label="ML Analysis" />
        <TabButton active={activeTab === 'project'} onClick={() => setActiveTab('project')} icon={Info} label="Project Info" />
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Server Load" value={`${Math.floor(serverLoad)}%`} icon={Server} color={serverLoad > 80 ? "text-red-500" : serverLoad > 50 ? "text-amber-500" : "text-emerald-500"} />
              <StatCard label="Total Requests" value={Math.floor(stats[stats.length-1]?.requests || 0).toString()} icon={Globe} />
              <StatCard label="Attacks Detected" value={isAttackActive ? "38" : "0"} icon={Zap} color="text-red-500" />
              <StatCard label="IPs Blocked" value={blockedIPs.length.toString()} icon={Lock} color="text-emerald-500" />
            </div>

            {/* Charts & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Traffic Monitor */}
              <div className="lg:col-span-3 brutal-card p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl serif-heading">Real-time Traffic Monitor</h2>
                  <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" /> Normal</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /> Attack</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300" /> Blocked</span>
                  </div>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ border: '2px solid black', borderRadius: '0px', boxShadow: '4px 4px 0px black' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="requests" 
                        stackId="1"
                        stroke="none" 
                        fill="#10B981" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="malicious" 
                        stackId="1"
                        stroke="none" 
                        fill="#EF4444" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Prevention Module Sidebar */}
              <div className="brutal-card p-8 flex flex-col">
                <h2 className="text-xl serif-heading mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Prevention Module
                </h2>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {blockedIPs.length === 0 && (
                    <div className="text-center py-12 opacity-30 italic text-sm">No active threats</div>
                  )}
                  {blockedIPs.map((block, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-50 border border-red-200 p-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="font-mono text-xs font-bold">{block.ip}</span>
                      </div>
                      <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">BLOCKED</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'ml' && (
          <div className="brutal-card p-12 max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl serif-heading">Machine Learning Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-widest text-xs opacity-50">Algorithm</h3>
                <p className="text-lg">Random Forest Hybrid Model</p>
                <p className="text-sm text-black/60 leading-relaxed">
                  Utilizes an ensemble of decision trees to classify network packets. The hybrid approach combines 
                  signature-based detection with anomaly-based behavioral analysis for 99.4% accuracy.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-widest text-xs opacity-50">Dataset</h3>
                <p className="text-lg">CICDDoS2019</p>
                <p className="text-sm text-black/60 leading-relaxed">
                  Trained on real-world DDoS traffic data from the Canadian Institute for Cybersecurity, 
                  covering LDAP, MSSQL, NetBIOS, and UDP flood attacks.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'project' && (
          <div className="brutal-card p-12 max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl serif-heading">Project Information</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-black pl-6 py-2">
                <h3 className="font-bold text-xl mb-2">Aim of the Project</h3>
                <p className="text-black/70">To detect and prevent DDoS attacks in real time using machine learning, protecting servers from being overloaded by fake traffic.</p>
              </div>
              <div className="border-l-4 border-black pl-6 py-2">
                <h3 className="font-bold text-xl mb-2">Technologies Used</h3>
                <ul className="list-disc list-inside text-black/70 space-y-1">
                  <li>Python (Scikit-learn, Pandas, NumPy)</li>
                  <li>Random Forest Algorithm</li>
                  <li>React & Tailwind CSS (Dashboard)</li>
                  <li>CICDDoS2019 Dataset</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1a1a1a] text-white p-4 brutal-card border-white/10 min-w-[280px] shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="bg-red-500/20 p-2 rounded">
                  <Zap className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Prevention Active</p>
                  <p className="font-bold text-sm">Blocked IP: {toast.ip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-12 py-4 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] border-r-2 border-black transition-all",
        active ? "tab-active" : "hover:bg-black/5"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="brutal-card p-6 flex items-center gap-6">
      <div className="bg-black/5 p-3 rounded">
        <Icon className={cn("w-6 h-6", color || "text-black")} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{label}</p>
        <h4 className={cn("text-3xl font-black serif-heading", color || "text-black")}>{value}</h4>
      </div>
    </div>
  );
}
