
import React, { useState, useEffect } from 'react';
import RecruitmentForm from './components/RecruitmentForm.tsx';
import AdminLogin from './components/AdminLogin.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { Candidate, Member, CandidateStatus, RPAction, Transaction, Warning } from './types.ts';

const App: React.FC = () => {
  const [view, setView] = useState<'recruitment' | 'login' | 'dashboard'>('recruitment');
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [actions, setActions] = useState<RPAction[]>([]);
  const [finances, setFinances] = useState<Transaction[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregamento Inicial
  useEffect(() => {
    const loadData = () => {
      try {
        const c = localStorage.getItem('imp_c');
        const m = localStorage.getItem('imp_m');
        const a = localStorage.getItem('imp_a');
        const f = localStorage.getItem('imp_f');
        const w = localStorage.getItem('imp_w');
        
        if (c) setCandidates(JSON.parse(c));
        if (a) setActions(JSON.parse(a));
        if (f) setFinances(JSON.parse(f));
        if (w) setWarnings(JSON.parse(w));

        if (m) {
          setMembers(JSON.parse(m));
        } else {
          setMembers([{
            id: 'owner-01',
            name: 'Iago_SND',
            role: 'Don Supremo',
            profession: 'Executor (Combate)',
            points: 99999,
            status: 'Ativo',
            joinedAt: new Date().toISOString()
          }]);
        }
      } catch (e) { console.error("Erro na leitura do banco local"); }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Persistência Automática
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('imp_c', JSON.stringify(candidates));
      localStorage.setItem('imp_m', JSON.stringify(members));
      localStorage.setItem('imp_a', JSON.stringify(actions));
      localStorage.setItem('imp_f', JSON.stringify(finances));
      localStorage.setItem('imp_w', JSON.stringify(warnings));
    }
  }, [candidates, members, actions, finances, warnings, isLoaded]);

  const handleImportData = (data: any) => {
    if (data.candidates) setCandidates(data.candidates);
    if (data.members) setMembers(data.members);
    if (data.actions) setActions(data.actions);
    if (data.finances) setFinances(data.finances);
    if (data.warnings) setWarnings(data.warnings);
    alert("BANCO DE DADOS SINCRONIZADO COM SUCESSO!");
  };

  if (!isLoaded) return <div className="bg-[#0a0a0c] h-screen w-screen flex items-center justify-center font-mono text-[#d4af37]">ACESSANDO_SERVIDOR_IMPERIVM...</div>;

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] select-none overflow-y-auto">
      {view === 'recruitment' && (
        <RecruitmentForm onSubmit={(c) => setCandidates(prev => [...prev, c])} onAdminAccess={() => setView('login')} />
      )}
      {view === 'login' && (
        <AdminLogin onSuccess={(user) => { setCurrentUser(user); setView('dashboard'); }} onCancel={() => setView('recruitment')} />
      )}
      {view === 'dashboard' && currentUser && (
        <AdminDashboard 
          currentUser={currentUser}
          candidates={candidates}
          members={members}
          actions={actions}
          finances={finances}
          warnings={warnings}
          onLogout={() => { setView('recruitment'); setCurrentUser(null); }}
          onApproveCandidate={(id) => {
            const c = candidates.find(x => x.id === id);
            if (c) {
              setCandidates(prev => prev.map(x => x.id === id ? { ...x, status: CandidateStatus.APPROVED } : x));
              setMembers(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                name: c.name,
                role: 'Recruta',
                profession: c.profession,
                points: 100,
                status: 'Ativo',
                joinedAt: new Date().toISOString()
              }]);
            }
          }}
          onRejectCandidate={(id) => setCandidates(prev => prev.map(x => x.id === id ? { ...x, status: CandidateStatus.REJECTED } : x))}
          onDelete={(type, id) => {
             if (type === 'member') setMembers(prev => prev.filter(m => m.id !== id));
             if (type === 'candidate') setCandidates(prev => prev.filter(c => c.id !== id));
             if (type === 'action') setActions(prev => prev.filter(a => a.id !== id));
             if (type === 'finance') setFinances(prev => prev.filter(f => f.id !== id));
             if (type === 'warning') setWarnings(prev => prev.filter(w => w.id !== id));
          }}
          onAddAction={(a) => setActions(prev => [a, ...prev])}
          onAddTransaction={(t) => setFinances(prev => [t, ...prev])}
          onAddWarning={(w) => setWarnings(prev => [w, ...prev])}
          onUpdateMember={(m) => setMembers(prev => prev.map(x => x.id === m.id ? m : x))}
          onUpdateAction={(a) => setActions(prev => prev.map(x => x.id === a.id ? a : x))}
          onUpdateFinance={(f) => setFinances(prev => prev.map(x => x.id === f.id ? f : x))}
          onUpdateWarning={(w) => setWarnings(prev => prev.map(x => x.id === w.id ? w : x))}
          onImportData={handleImportData}
        />
      )}
    </div>
  );
};

export default App;
