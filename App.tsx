
import React, { useState, useEffect } from 'react';
import RecruitmentForm from './components/RecruitmentForm.tsx';
import AdminLogin from './components/AdminLogin.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { Candidate, Member, CandidateStatus, RPAction, Transaction, Warning, Rank, SystemLog, InventoryItem } from './types.ts';
import { motion } from 'framer-motion';
import { Lock, Skull, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [view, setView] = useState<'recruitment' | 'login' | 'dashboard'>('recruitment');
  const [isSystemClosed, setIsSystemClosed] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [actions, setActions] = useState<RPAction[]>([]);
  const [finances, setFinances] = useState<Transaction[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const addLog = (message: string, type: 'INFO' | 'ALERT' | 'SUCCESS' | 'AI' = 'INFO') => {
    setLogs(prev => [{ id: Date.now().toString(), message, date: new Date().toISOString(), type }, ...prev].slice(0, 50));
  };

  // Integração com IA Gemini para o Oráculo
  const askOracle = async (prompt: string) => {
    try {
      addLog("Consultando Oráculo Imperial...", "AI");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `Você é o Oráculo do Cartel Imperial, uma organização de elite. 
      Sua personalidade é fria, calculista e leal. Analise os dados da máfia: 
      Membros: ${members.length}, Saldo: ${finances.reduce((a, b) => a + (b.type === 'INCOME' ? b.amount : -b.amount), 0)}, 
      Advertências: ${warnings.length}. Responda de forma curta e estratégica.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction }
      });

      const text = response.text || "Falha na conexão com o plano astral.";
      addLog(`Oráculo: ${text.substring(0, 100)}...`, "AI");
      return text;
    } catch (e) {
      addLog("Oráculo indisponível no momento.", "ALERT");
      return "O silêncio é a resposta dos deuses.";
    }
  };

  useEffect(() => {
    const loadData = () => {
      try {
        const storagePrefix = 'imp_vInf_';
        const c = localStorage.getItem(storagePrefix + 'c');
        const m = localStorage.getItem(storagePrefix + 'm');
        const a = localStorage.getItem(storagePrefix + 'a');
        const f = localStorage.getItem(storagePrefix + 'f');
        const w = localStorage.getItem(storagePrefix + 'w');
        const l = localStorage.getItem(storagePrefix + 'l');
        const inv = localStorage.getItem(storagePrefix + 'inv');
        const closed = localStorage.getItem(storagePrefix + 'closed');
        
        if (closed === 'true') setIsSystemClosed(true);
        if (c) setCandidates(JSON.parse(c));
        if (a) setActions(JSON.parse(a));
        if (f) setFinances(JSON.parse(f));
        if (w) setWarnings(JSON.parse(w));
        if (l) setLogs(JSON.parse(l));
        if (inv) setInventory(JSON.parse(inv));

        if (m) {
          setMembers(JSON.parse(m));
        } else {
          setMembers([{
            id: 'owner-01',
            name: 'Iago_SND',
            role: 'Don Supremo',
            profession: 'Executor (Combate)',
            points: 5000,
            status: 'Ativo',
            joinedAt: new Date().toISOString()
          }]);
        }
      } catch (e) { console.error("Sincronia corrompida."); }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const storagePrefix = 'imp_vInf_';
      localStorage.setItem(storagePrefix + 'c', JSON.stringify(candidates));
      localStorage.setItem(storagePrefix + 'm', JSON.stringify(members));
      localStorage.setItem(storagePrefix + 'a', JSON.stringify(actions));
      localStorage.setItem(storagePrefix + 'f', JSON.stringify(finances));
      localStorage.setItem(storagePrefix + 'w', JSON.stringify(warnings));
      localStorage.setItem(storagePrefix + 'l', JSON.stringify(logs));
      localStorage.setItem(storagePrefix + 'inv', JSON.stringify(inventory));
      localStorage.setItem(storagePrefix + 'closed', isSystemClosed ? 'true' : 'false');
    }
  }, [candidates, members, actions, finances, warnings, logs, inventory, isLoaded, isSystemClosed]);

  // Fix: Adicionando manipulador para aprovação de candidatos
  const handleApproveCandidate = (id: string) => {
    const c = candidates.find(x => x.id === id);
    if (!c) return;
    const bonus = (parseInt(c.proficiencyLevel) || 5) * 50;
    setCandidates(prev => prev.map(x => x.id === id ? { ...x, status: CandidateStatus.APPROVED } : x));
    setMembers(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name: c.name,
      role: 'Recruta' as Rank,
      profession: c.profession,
      points: bonus,
      status: 'Ativo',
      joinedAt: new Date().toISOString()
    }]);
    addLog(`Recruta ${c.name} juramentado. Honra: +${bonus}`, 'SUCCESS');
  };

  // Fix: Adicionando manipulador para rejeição de candidatos
  const handleRejectCandidate = (id: string) => {
    setCandidates(prev => prev.map(x => x.id === id ? { ...x, status: CandidateStatus.REJECTED } : x));
    addLog(`Dossiê de candidato rejeitado.`, 'ALERT');
  };

  if (!isLoaded) return <div className="h-screen w-screen bg-black flex items-center justify-center"><Loader2 size={60} className="text-red-700 animate-spin" /></div>;

  if (view === 'login') return <AdminLogin onSuccess={(user) => { setCurrentUser(user); setView('dashboard'); addLog(`Terminal acessado por ${user.name}.`); }} onCancel={() => setView('recruitment')} />;

  if (view === 'dashboard' && currentUser) {
    return (
      <AdminDashboard 
        currentUser={currentUser}
        candidates={candidates}
        members={members}
        actions={actions}
        finances={finances}
        warnings={warnings}
        inventory={inventory}
        logs={logs}
        onLogout={() => { setView('recruitment'); setCurrentUser(null); }}
        // Fix: Adicionando propriedades obrigatórias que estavam ausentes
        onApproveCandidate={handleApproveCandidate}
        onRejectCandidate={handleRejectCandidate}
        onAddAction={(a) => { setActions(prev => [a, ...prev]); addLog(`Missão ${a.type} registrada.`); }}
        onAddTransaction={(t) => { setFinances(prev => [t, ...prev]); addLog(`Cofre: $${t.amount} (${t.type})`, t.type === 'INCOME' ? 'SUCCESS' : 'ALERT'); }}
        onAddWarning={(w) => { setWarnings(prev => [w, ...prev]); addLog(`Advertência: ${w.memberName}`, 'ALERT'); }}
        onAddInventory={(item) => { setInventory(prev => [item, ...prev]); addLog(`Arsenal: ${item.name} adicionado.`); }}
        onUpdateMember={(id, updates) => setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))}
        onUpdateMemberPoints={(id, pts) => setMembers(prev => prev.map(m => m.id === id ? { ...m, points: Math.max(0, m.points + pts) } : m))}
        onAskOracle={askOracle}
        onDelete={(type, id) => {
           if (type === 'member') setMembers(prev => prev.filter(m => m.id !== id));
           if (type === 'candidate') setCandidates(prev => prev.filter(c => c.id !== id));
           if (type === 'action') setActions(prev => prev.filter(a => a.id !== id));
           if (type === 'finance') setFinances(prev => prev.filter(f => f.id !== id));
           if (type === 'warning') setWarnings(prev => prev.filter(w => w.id !== id));
           if (type === 'inventory') setInventory(prev => prev.filter(i => i.id !== id));
           addLog(`Remoção de registro: ${id}`);
        }}
        onResetSystem={() => { if(confirm("FORMATAÇÃO TOTAL?")) { localStorage.clear(); window.location.reload(); } }}
      />
    );
  }

  if (isSystemClosed) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="absolute top-10 left-10"><motion.button whileHover={{ scale: 1.1 }} onClick={() => setView('login')} className="p-4 text-red-950 cursor-pointer"><Lock size={40} /></motion.button></div>
      <Skull className="w-48 h-48 text-red-900 mb-10 drop-shadow-[0_0_40px_rgba(185,28,28,0.5)]" />
      <h1 className="font-cinzel text-6xl font-black text-white tracking-[0.5em] mb-4">IMPERIVM</h1>
      <p className="text-zinc-800 uppercase tracking-widest text-[10px] mb-12 italic">Criptografado e Silencioso</p>
      <button onClick={() => setIsSystemClosed(false)} className="px-12 py-5 border border-zinc-900 text-zinc-900 hover:text-white hover:border-white transition-all uppercase font-black tracking-widest text-[10px] rounded-full">Reativar</button>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-black overflow-y-auto custom-scroll">
      <RecruitmentForm 
        onSubmit={(c) => { setCandidates(prev => [...prev, c]); setIsSystemClosed(true); addLog(`Inscrição recebida: ${c.name}`); }} 
        onAdminAccess={() => setView('login')}
      />
    </div>
  );
};

export default App;
