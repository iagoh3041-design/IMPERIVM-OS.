
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, LayoutDashboard, UserPlus, X, Target, Menu,
  Trash2, Crown, Landmark, Activity, Search, ShieldAlert, 
  Gavel, Skull, User, LogOut, Plus, ArrowRight, ShieldCheck, 
  Award, Edit3, Terminal, Sparkles, Network, Package, Loader2,
  TrendingUp, TrendingDown, AlertCircle, Clock as ClockIcon,
  Calendar, Send, ShieldX, Info, Brain, Eye
} from 'lucide-react';
import { Candidate, Member, RPAction, Transaction, Warning, CandidateStatus, Rank, Profession, SystemLog, InventoryItem } from '../types.ts';

interface Props {
  currentUser: { name: string, role: string };
  candidates: Candidate[];
  members: Member[];
  actions: RPAction[];
  finances: Transaction[];
  warnings: Warning[];
  inventory: InventoryItem[];
  logs: SystemLog[];
  onLogout: () => void;
  onApproveCandidate: (id: string) => void;
  onRejectCandidate: (id: string) => void;
  onDelete: (type: string, id: string) => void;
  onResetSystem: () => void;
  onAddAction: (a: RPAction) => void;
  onAddTransaction: (t: Transaction) => void;
  onAddWarning: (w: Warning) => void;
  onAddInventory: (i: InventoryItem) => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onUpdateMemberPoints: (id: string, points: number) => void;
  onAskOracle: (prompt: string) => Promise<string>;
}

const AdminDashboard: React.FC<Props> = ({ 
  currentUser, candidates, members, actions, finances, warnings, inventory, logs,
  onLogout, onApproveCandidate, onRejectCandidate, onDelete, onAddAction, onAddTransaction, onAddWarning, onAddInventory,
  onUpdateMember, onUpdateMemberPoints, onAskOracle
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recruitment' | 'members' | 'actions' | 'finances' | 'punishments' | 'inventory' | 'oracle' | 'orgchart'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [oraclePrompt, setOraclePrompt] = useState('');
  const [oracleResponse, setOracleResponse] = useState('');
  const [isOracleLoading, setIsOracleLoading] = useState(false);

  // Modais
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const isSupremo = currentUser.role === 'Don Supremo';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const balance = useMemo(() => 
    finances.reduce((acc, f) => acc + (f.type === 'INCOME' ? f.amount : -f.amount), 0) + 
    actions.reduce((acc, a) => acc + a.loot, 0)
  , [finances, actions]);

  const RANKS: Rank[] = ['Don Supremo', 'Sub-Don', 'Conselheiro', 'Capitão', 'Tenente', 'Soldado', 'Recruta', 'Associado', 'Afastado'];
  const PROFESSIONS: Profession[] = ['Executor (Combate)', 'Piloto (Fuga/Logística)', 'Hacker (Inteligência)', 'Negociador (Diplomacia)', 'Químico (Produção)'];

  const handleOracleCall = async () => {
    if (!oraclePrompt) return;
    setIsOracleLoading(true);
    const res = await onAskOracle(oraclePrompt);
    setOracleResponse(res);
    setIsOracleLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden mobile-safe-top mobile-safe-bottom">
      
      {/* SIDEBAR MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-md z-[1000]" />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed inset-y-0 left-0 w-72 bg-[#0c0c0e] border-r border-red-950/30 z-[1001] p-6 flex flex-col shadow-[10px_0_50px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10">
                <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-500/40">
                    <Skull size={24} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-xs font-cinzel font-black uppercase text-white truncate w-40">{currentUser.name}</h2>
                  <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest">{currentUser.role}</p>
                </div>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto custom-scroll pr-2">
                <NavItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                <NavItem active={activeTab === 'members'} onClick={() => { setActiveTab('members'); setIsMobileMenuOpen(false); }} icon={<Users size={20}/>} label="Operativos" />
                <NavItem active={activeTab === 'orgchart'} onClick={() => { setActiveTab('orgchart'); setIsMobileMenuOpen(false); }} icon={<Network size={20}/>} label="Hierarquia" />
                <NavItem active={activeTab === 'recruitment'} onClick={() => { setActiveTab('recruitment'); setIsMobileMenuOpen(false); }} icon={<UserPlus size={20}/>} label="Recrutamento" badge={candidates.filter(c => c.status === CandidateStatus.PENDING).length} />
                <NavItem active={activeTab === 'actions'} onClick={() => { setActiveTab('actions'); setIsMobileMenuOpen(false); }} icon={<Target size={20}/>} label="Incursões" />
                <NavItem active={activeTab === 'finances'} onClick={() => { setActiveTab('finances'); setIsMobileMenuOpen(false); }} icon={<Landmark size={20}/>} label="Tesouraria" />
                <NavItem active={activeTab === 'punishments'} onClick={() => { setActiveTab('punishments'); setIsMobileMenuOpen(false); }} icon={<Gavel size={20}/>} label="Corregedoria" />
                <NavItem active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} icon={<Package size={20}/>} label="Arsenal" />
                <NavItem active={activeTab === 'oracle'} onClick={() => { setActiveTab('oracle'); setIsMobileMenuOpen(false); }} icon={<Sparkles size={20}/>} label="Oráculo IA" />
              </nav>
              <button onClick={onLogout} className="mt-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center justify-center gap-3 bg-white/5 rounded-xl border border-white/5 active:scale-95"><LogOut size={16}/> Sair</button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-[#0c0c0e] border-r border-white/10 flex-col p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
                <Skull size={24} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-cinzel font-black uppercase text-white truncate w-32">{currentUser.name}</h2>
              <p className="text-[10px] text-red-500 font-bold uppercase">{currentUser.role}</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={<Users size={20}/>} label="Tropa Imperial" />
            <NavItem active={activeTab === 'orgchart'} onClick={() => setActiveTab('orgchart')} icon={<Network size={20}/>} label="Hierarquia" />
            <NavItem active={activeTab === 'recruitment'} onClick={() => setActiveTab('recruitment')} icon={<UserPlus size={20}/>} label="Recrutamento" badge={candidates.filter(c => c.status === CandidateStatus.PENDING).length} />
            <NavItem active={activeTab === 'actions'} onClick={() => setActiveTab('actions')} icon={<Target size={20}/>} label="Incursões" />
            <NavItem active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} icon={<Landmark size={20}/>} label="Tesouraria" />
            <NavItem active={activeTab === 'punishments'} onClick={() => setActiveTab('punishments')} icon={<Gavel size={20}/>} label="Corregedoria" />
            <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20}/>} label="Arsenal" />
            <NavItem active={activeTab === 'oracle'} onClick={() => setActiveTab('oracle')} icon={<Sparkles size={20}/>} label="Oráculo IA" />
          </nav>
          <button onClick={onLogout} className="mt-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all flex items-center gap-4"><LogOut size={18}/> Sair</button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 bg-black relative">
        <header className="h-24 lg:h-32 border-b border-white/10 flex items-center justify-between px-6 lg:px-12 bg-[#070708] backdrop-blur-2xl shrink-0 z-40">
           <div className="flex items-center gap-4 lg:gap-8">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-white/5 rounded-xl border border-white/10 text-white"><Menu size={24}/></button>
             <div>
               <h1 className="text-xl lg:text-3xl font-cinzel font-black uppercase tracking-[0.3em] text-white">{activeTab}</h1>
               <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">Ativo • {currentTime.toLocaleTimeString()}</p>
               </div>
             </div>
           </div>

           <div className="flex flex-col items-end gap-1">
             <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Patrimônio</p>
             <p className={`text-xl lg:text-4xl font-mono font-black ${balance >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>$ {balance.toLocaleString()}</p>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 lg:p-14 custom-scroll">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  <StatCard label="OPERATIVOS" value={members.length} icon={<Users size={20}/>} color="text-red-500" />
                  <StatCard label="MISSÕES" value={actions.length} icon={<Activity size={20}/>} color="text-white" />
                  <StatCard label="HONRA" value={members.reduce((a,b)=>a+b.points,0)} icon={<Award size={20}/>} color="text-emerald-400" />
                  <StatCard label="DOSSIÊS" value={candidates.filter(c=>c.status===CandidateStatus.PENDING).length} icon={<UserPlus size={20}/>} color="text-zinc-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem] flex flex-col">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3"><Terminal size={18} className="text-red-500"/> LOGS DE SISTEMA</h3>
                        <span className="text-[9px] font-mono text-zinc-500">REALTIME_FEED</span>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scroll pr-2">
                        {logs.length > 0 ? logs.map(log => (
                          <div key={log.id} className="p-4 bg-white/[0.02] rounded-2xl border-l-4 border-red-600 flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                               <span>{new Date(log.date).toLocaleString()}</span>
                               <span className="uppercase text-red-950 font-black">{log.type}</span>
                            </div>
                            <span className="uppercase text-zinc-100 font-bold text-xs">{log.message}</span>
                          </div>
                        )) : <p className="text-zinc-700 text-center uppercase text-[10px] py-10">Sem atividade recente</p>}
                      </div>
                   </div>
                   <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                      <Skull size={60} className="text-red-600 opacity-20 mb-8" />
                      <p className="text-xs font-cinzel font-black text-white uppercase tracking-widest">Protocolo Imperivm</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-4 leading-relaxed italic">"Silêncio é a nossa maior virtude."</p>
                   </div>
                </div>
              </motion.div>
            )}

            {/* RECRUITMENT TAB (Aba revisada e corrigida) */}
            {activeTab === 'recruitment' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Análise de Dossiês Pendentes</h2>
                  <span className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-xl">
                    {candidates.filter(c => c.status === CandidateStatus.PENDING).length} AGUARDANDO
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.filter(c => c.status === CandidateStatus.PENDING).map(c => (
                    <div key={c.id} className="glass-panel p-6 rounded-[2rem] border-white/10 flex flex-col gap-4 group hover:border-red-500/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] text-zinc-500 font-mono uppercase mb-1">Recebido em: {new Date(c.date).toLocaleString()}</p>
                          <h4 className="text-xl font-black text-white uppercase tracking-tight">{c.name}</h4>
                          <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">{c.profession}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-red-500">
                          <Eye size={20} />
                        </div>
                      </div>
                      <button onClick={() => setSelectedCandidate(c)} className="w-full py-4 bg-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/5 active:scale-95 hover:bg-white hover:text-black transition-all">Ver Detalhes</button>
                    </div>
                  ))}
                  {candidates.filter(c => c.status === CandidateStatus.PENDING).length === 0 && (
                    <div className="col-span-full">
                      <EmptyState icon={<UserPlus size={48}/>} message="Nenhum novo operativo solicitou alistamento." />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ACTIONS TAB */}
            {activeTab === 'actions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Arquivo de Incursões</h2>
                  <button onClick={()=>setIsActionModalOpen(true)} className="p-4 bg-red-600 text-white rounded-2xl active:scale-95"><Plus size={24}/></button>
                </div>
                <div className="space-y-4">
                  {actions.length > 0 ? actions.map(action => (
                    <div key={action.id} className="glass-panel p-6 rounded-[2rem] border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group">
                       <div className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${action.success ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500'}`}>
                           <Target size={28}/>
                         </div>
                         <div>
                           <h4 className="text-lg font-black text-white uppercase tracking-tight">{action.type}</h4>
                           <p className="text-[10px] text-zinc-500 font-mono uppercase font-bold">{new Date(action.date).toLocaleString()} • {action.participants}</p>
                         </div>
                       </div>
                       <div className="flex items-center justify-between lg:justify-end gap-12 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                         <div className="text-left lg:text-right">
                            <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Loot Coletado</p>
                            <p className="text-2xl font-mono font-black text-emerald-400">+$ {action.loot.toLocaleString()}</p>
                         </div>
                         <button onClick={()=>onDelete('action', action.id)} className="p-3 text-zinc-800 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                       </div>
                    </div>
                  )) : <EmptyState icon={<Target size={48}/>} message="Sem incursões registradas no arquivo central."/>}
                </div>
              </motion.div>
            )}

            {/* FINANCES TAB */}
            {activeTab === 'finances' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-2 gap-4 lg:gap-8">
                   <div className="glass-panel p-6 lg:p-10 rounded-[2.5rem] border-emerald-500/20">
                      <TrendingUp className="text-emerald-400 mb-4" size={24}/>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Entradas</p>
                      <p className="text-xl lg:text-3xl font-mono font-black text-white">$ {finances.filter(f=>f.type==='INCOME').reduce((a,b)=>a+b.amount,0).toLocaleString()}</p>
                   </div>
                   <div className="glass-panel p-6 lg:p-10 rounded-[2.5rem] border-red-500/20">
                      <TrendingDown className="text-red-500 mb-4" size={24}/>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Saídas</p>
                      <p className="text-xl lg:text-3xl font-mono font-black text-white">$ {finances.filter(f=>f.type==='EXPENSE').reduce((a,b)=>a+b.amount,0).toLocaleString()}</p>
                   </div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Tesouraria Imperial</h3>
                  <button onClick={()=>setIsFinanceModalOpen(true)} className="p-4 bg-emerald-600 text-white rounded-2xl active:scale-95"><Plus size={24}/></button>
                </div>
                <div className="space-y-4">
                  {finances.length > 0 ? finances.map(f => (
                    <div key={f.id} className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center justify-between group">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-500 font-mono font-bold">{new Date(f.date).toLocaleString()}</span>
                        <span className="text-base font-black text-white uppercase">{f.description}</span>
                        <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em]">{f.category}</span>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <span className={`text-xl font-mono font-black ${f.type === 'INCOME' ? 'text-emerald-400' : 'text-red-500'}`}>
                          {f.type === 'INCOME' ? '+' : '-'} ${f.amount.toLocaleString()}
                        </span>
                        <button onClick={()=>onDelete('finance', f.id)} className="p-3 text-zinc-800 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  )) : <EmptyState icon={<Landmark size={48}/>} message="Nenhum lançamento registrado."/>}
                </div>
              </motion.div>
            )}

            {/* PUNISHMENTS TAB */}
            {activeTab === 'punishments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Tribunal Disciplinar</h2>
                  <button onClick={()=>setIsWarningModalOpen(true)} className="p-4 bg-red-950 border border-red-600 text-red-500 rounded-2xl active:scale-95"><ShieldX size={24}/></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {warnings.length > 0 ? warnings.map(w => (
                    <div key={w.id} className="glass-panel p-8 rounded-[2.5rem] border-red-900/20 relative group">
                       <div className="flex items-center gap-5 mb-6">
                         <div className="w-12 h-12 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-600"><Gavel size={24}/></div>
                         <div>
                           <h4 className="text-lg font-black text-white uppercase">{w.memberName}</h4>
                           <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase">{new Date(w.date).toLocaleString()}</p>
                         </div>
                       </div>
                       <p className="text-[10px] font-black uppercase mb-2 text-red-500">Gravidade: {w.severity}</p>
                       <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-xs text-zinc-300 italic mb-6 leading-relaxed">
                          "{w.reason}"
                       </div>
                       <button onClick={()=>onDelete('warning', w.id)} className="text-[10px] font-black text-zinc-700 hover:text-red-500 uppercase"><Trash2 size={16} className="inline mr-2"/>Remover Advertência</button>
                    </div>
                  )) : <EmptyState icon={<Gavel size={48}/>} message="Nenhuma sentença ativa no tribunal."/>}
                </div>
              </motion.div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Gestão de Arsenal</h2>
                  <button onClick={()=>setIsInventoryModalOpen(true)} className="p-4 bg-red-600 text-white rounded-2xl active:scale-95"><Plus size={24}/></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {inventory.map(item => (
                    <div key={item.id} className="glass-panel p-6 rounded-[2.5rem] border-white/10 relative group">
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-white/5 rounded-xl text-zinc-500"><Package size={20}/></div>
                          <span className="text-[9px] font-black text-red-500 uppercase">{item.category}</span>
                       </div>
                       <h4 className="text-lg font-black text-white uppercase tracking-tight mb-6">{item.name}</h4>
                       <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 mb-2">
                          <span>Estoque</span>
                          <span>{item.quantity} un</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600" style={{ width: `${Math.min((item.quantity/50)*100, 100)}%` }} />
                       </div>
                       <button onClick={()=>onDelete('inventory', item.id)} className="absolute top-4 right-4 p-2 text-zinc-800 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  {inventory.length === 0 && <div className="col-span-full"><EmptyState icon={<Package size={48}/>} message="O arsenal está vazio." /></div>}
                </div>
              </motion.div>
            )}

            {/* ORACLE TAB */}
            {activeTab === 'oracle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-6">
                <div className="glass-panel p-8 rounded-[3rem] border-purple-900/20 bg-purple-950/5 flex-1 flex flex-col min-h-[400px]">
                   <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/5">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400">
                         <Sparkles size={24}/>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Oráculo Imperial IA</h3>
                        <p className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-widest mt-1">Inteligência Estratégica</p>
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scroll mb-8 space-y-6 pr-2">
                      {oracleResponse ? (
                        <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 leading-relaxed text-zinc-200 font-mono text-sm border-l-4 border-l-purple-600">
                          {oracleResponse}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                          <Brain size={60} className="mb-6 text-purple-500" />
                          <p className="text-xs font-black text-white uppercase tracking-[0.3em]">Aguardando Prompt de Comando</p>
                        </div>
                      )}
                   </div>
                   <div className="relative">
                      <textarea value={oraclePrompt} onChange={(e)=>setOraclePrompt(e.target.value)} placeholder="CONSULTAR ESTRATÉGIA OU RISCOS..." className="input-prestige h-32 pt-6 pl-8 pr-24 resize-none border-purple-900/30" />
                      <button onClick={handleOracleCall} disabled={isOracleLoading || !oraclePrompt} className="absolute bottom-4 right-4 p-5 bg-purple-600 text-white rounded-2xl shadow-xl disabled:opacity-50">
                        {isOracleLoading ? <Loader2 className="animate-spin" /> : <Send size={24}/>}
                      </button>
                   </div>
                </div>
              </motion.div>
            )}

            {/* ORG CHART / HIERARCHY */}
            {activeTab === 'orgchart' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 py-10">
                 <div className="flex flex-col items-center gap-16">
                    {members.filter(m => m.role === 'Don Supremo').map(m => (
                      <div key={m.id} className="relative group">
                        <div className="p-8 bg-red-600/5 border-2 border-red-600 rounded-[3rem] text-center w-72 shadow-[0_0_50px_rgba(255,51,51,0.1)]">
                          <Crown size={32} className="mx-auto text-red-500 mb-4"/>
                          <p className="text-xl font-cinzel font-black text-white">{m.name}</p>
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Líder Supremo</p>
                        </div>
                        <div className="absolute top-full left-1/2 w-0.5 h-16 bg-red-600/30 -translate-x-1/2" />
                      </div>
                    ))}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
                       {members.filter(m => m.role === 'Sub-Don').map(m => (
                         <div key={m.id} className="p-6 glass-panel rounded-[2rem] border-red-500/20 text-center relative">
                            <ShieldCheck size={24} className="mx-auto text-zinc-400 mb-3"/>
                            <p className="text-lg font-black text-white">{m.name}</p>
                            <p className="text-[9px] font-black text-zinc-500 uppercase">Sub-Comando</p>
                         </div>
                       ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                       {members.filter(m => m.role === 'Capitão').map(m => (
                         <div key={m.id} className="p-6 glass-panel rounded-[2rem] border-white/5 text-center">
                            <Target size={20} className="mx-auto text-zinc-600 mb-3"/>
                            <p className="text-md font-black text-white">{m.name}</p>
                            <p className="text-[9px] font-black text-zinc-600 uppercase">Capitão</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {/* MEMBERS LIST */}
            {activeTab === 'members' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="relative mb-8">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input type="text" placeholder="LOCALIZAR OPERATIVO..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border-2 border-white/5 rounded-2xl py-6 pl-16 pr-6 text-sm font-black uppercase outline-none focus:border-red-600/30 text-white placeholder:text-zinc-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                    <div key={m.id} className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative group hover:border-red-500/20 transition-all">
                       <div className="flex justify-between items-start mb-8">
                         <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-zinc-600 group-hover:text-red-500 transition-colors"><User size={28} /></div>
                         <div className="flex gap-2">
                           <button onClick={() => setEditingMember(m)} className="p-3 bg-black rounded-xl text-zinc-500 hover:text-white border border-white/5"><Edit3 size={18}/></button>
                           {isSupremo && m.id !== 'owner-01' && <button onClick={() => onDelete('member', m.id)} className="p-3 bg-black rounded-xl text-zinc-700 hover:text-red-900 border border-white/5"><Trash2 size={18}/></button>}
                         </div>
                       </div>
                       <h4 className="text-2xl font-black uppercase text-white tracking-tight mb-1">{m.name}</h4>
                       <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mb-10">{m.role}</p>
                       <div className="flex justify-between items-end border-t border-white/5 pt-8">
                          <div>
                            <p className="text-[9px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Honra</p>
                            <p className="text-3xl font-mono font-black text-emerald-400">{m.points}</p>
                          </div>
                          <p className="text-[10px] font-black text-white uppercase bg-white/5 px-4 py-2 rounded-xl border border-white/5">{m.profession.split(' ')[0]}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* MODAIS GLOBAIS */}
      <AnimatePresence>
        {isInventoryModalOpen && <Modal title="Arsenal Imperial" onClose={()=>setIsInventoryModalOpen(false)}><InventoryForm onAdd={(i:any)=>{onAddInventory(i); setIsInventoryModalOpen(false);}}/></Modal>}
        {isActionModalOpen && <Modal title="Registrar Operação" onClose={()=>setIsActionModalOpen(false)}><ActionForm onAdd={(a:any)=>{onAddAction(a); setIsActionModalOpen(false);}}/></Modal>}
        {isFinanceModalOpen && <Modal title="Movimentação de Cofre" onClose={()=>setIsFinanceModalOpen(false)}><FinanceForm onAdd={(f:any)=>{onAddTransaction(f); setIsFinanceModalOpen(false);}}/></Modal>}
        {isWarningModalOpen && <Modal title="Sentença Disciplinar" onClose={()=>setIsWarningModalOpen(false)}><WarningForm members={members} onAdd={(w:any)=>{onAddWarning(w); setIsWarningModalOpen(false);}}/></Modal>}
        {selectedCandidate && <Modal title="Análise de Dossiê" onClose={()=>setSelectedCandidate(null)}><DossierView candidate={selectedCandidate} isSupremo={isSupremo} onApprove={()=>{onApproveCandidate(selectedCandidate.id); setSelectedCandidate(null);}} onReject={()=>{onRejectCandidate(selectedCandidate.id); setSelectedCandidate(null);}} /></Modal>}
        {editingMember && <Modal title="Perfil de Operativo" onClose={()=>setEditingMember(null)}><EditMemberForm member={editingMember} onUpdate={(id, upds)=>{onUpdateMember(id, upds); setEditingMember(null);}} ranks={RANKS} professions={PROFESSIONS}/></Modal>}
      </AnimatePresence>
    </div>
  );
};

// COMPONENTES AUXILIARES UI
const NavItem = ({ active, onClick, icon, label, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${active ? 'bg-red-600 text-white shadow-2xl shadow-red-900/40' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-4"><span>{icon}</span><span className="text-xs font-black uppercase tracking-widest">{label}</span></div>
    {badge > 0 && <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${active ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>{badge}</span>}
  </button>
);

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="glass-panel p-6 lg:p-10 rounded-[2.5rem] text-center border-white/5 group hover:bg-white/[0.02] transition-all">
    <div className={`mb-4 inline-block ${color} opacity-60 group-hover:opacity-100 transition-all`}>{icon}</div>
    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-2xl lg:text-4xl font-mono font-black text-white">{value}</p>
  </div>
);

const EmptyState = ({ icon, message }: any) => (
  <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 rounded-[3rem] border-2 border-dashed border-white/5 w-full">
    <div className="text-zinc-800 mb-6">{icon}</div>
    <p className="text-zinc-500 font-black uppercase tracking-widest text-[11px] px-8 text-center">{message}</p>
  </div>
);

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-0 md:p-10">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
    <motion.div initial={{ y: 500 }} animate={{ y: 0 }} exit={{ y: 500 }} className="w-full max-w-4xl glass-panel p-8 rounded-t-[3rem] md:rounded-[4rem] border-white/20 relative shadow-3xl z-10 overflow-hidden max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 shrink-0">
        <h2 className="text-xl md:text-3xl font-cinzel font-black uppercase text-white tracking-widest">{title}</h2>
        <button onClick={onClose} className="p-4 bg-zinc-900 rounded-2xl text-zinc-400 active:scale-90"><X size={24}/></button>
      </div>
      <div className="overflow-y-auto custom-scroll pr-2 flex-1 pb-10">{children}</div>
    </motion.div>
  </div>
);

// FORMULÁRIOS COM DATA E HORA
const ActionForm = ({ onAdd }: any) => {
  const [data, setData] = useState({ type: 'Assalto a Banco', participants: '', success: true, loot: 0, date: new Date().toISOString().slice(0, 16) });
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Tipo de Operação</label><input value={data.type} onChange={e=>setData({...data, type: e.target.value})} className="input-prestige" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Data e Hora</label><input type="datetime-local" value={data.date} onChange={e=>setData({...data, date: e.target.value})} className="input-prestige" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Participantes (Codinomes)</label><input value={data.participants} onChange={e=>setData({...data, participants: e.target.value})} className="input-prestige" placeholder="Iago, Krozz..." /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Loot Coletado ($)</label><input type="number" value={data.loot} onChange={e=>setData({...data, loot: Number(e.target.value)})} className="input-prestige" /></div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Status Final</label>
          <select value={data.success ? 'S' : 'F'} onChange={e=>setData({...data, success: e.target.value === 'S'})} className="input-prestige appearance-none">
            <option value="S">SUCESSO TOTAL</option><option value="F">FRACASSO OPERACIONAL</option>
          </select>
        </div>
      </div>
      <button onClick={()=>onAdd({...data, id: Date.now().toString()})} className="w-full py-6 bg-red-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95">Arquivar Missão</button>
    </div>
  );
};

const FinanceForm = ({ onAdd }: any) => {
  const [data, setData] = useState({ type: 'INCOME', category: 'Lucro de Crime', description: '', amount: 0, date: new Date().toISOString().slice(0, 16) });
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Natureza</label>
          <select value={data.type} onChange={e=>setData({...data, type: e.target.value as any})} className="input-prestige appearance-none">
            <option value="INCOME">ENTRADA (+)</option><option value="EXPENSE">SAÍDA (-)</option>
          </select>
        </div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Data e Hora</label><input type="datetime-local" value={data.date} onChange={e=>setData({...data, date: e.target.value})} className="input-prestige" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Categoria</label><input value={data.category} onChange={e=>setData({...data, category: e.target.value})} className="input-prestige" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Quantia ($)</label><input type="number" value={data.amount} onChange={e=>setData({...data, amount: Number(e.target.value)})} className="input-prestige" /></div>
      </div>
      <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Identificação / Detalhes</label><input value={data.description} onChange={e=>setData({...data, description: e.target.value})} className="input-prestige" /></div>
      <button onClick={()=>onAdd({...data, id: Date.now().toString()})} className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95">Lançar no Cofre</button>
    </div>
  );
};

const InventoryForm = ({ onAdd }: any) => {
  const [data, setData] = useState({ name: '', category: 'Armamento', quantity: 0, date: new Date().toISOString().slice(0, 10) });
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Equipamento</label><input value={data.name} onChange={e=>setData({...data, name: e.target.value})} className="input-prestige" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Data de Aquisição</label><input type="date" value={data.date} onChange={e=>setData({...data, date: e.target.value})} className="input-prestige" /></div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Categoria Bélica</label>
          <select value={data.category} onChange={e=>setData({...data, category: e.target.value as any})} className="input-prestige appearance-none">
            <option value="Armamento">ARMAMENTO</option><option value="Munição">MUNIÇÃO</option><option value="Veículo">VEÍCULO</option><option value="Ilegal">CONTRABANDO</option>
          </select>
        </div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Estoque</label><input type="number" value={data.quantity} onChange={e=>setData({...data, quantity: Number(e.target.value)})} className="input-prestige" /></div>
      </div>
      <button onClick={()=>onAdd({...data, id: Date.now().toString()})} className="w-full py-6 bg-red-600 text-white rounded-2xl font-black uppercase text-sm active:scale-95">Adicionar ao Arsenal</button>
    </div>
  );
};

const EditMemberForm = ({ member, onUpdate, ranks, professions }: any) => {
  const [data, setData] = useState({...member});
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Codinome</label><input value={data.name} onChange={e=>setData({...data, name: e.target.value})} className="input-prestige" /></div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Patente</label>
          <select value={data.role} onChange={e=>setData({...data, role: e.target.value as Rank})} className="input-prestige appearance-none">
            {ranks.map((r:string)=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Aptidão</label>
          <select value={data.profession} onChange={e=>setData({...data, profession: e.target.value as Profession})} className="input-prestige appearance-none">
            {professions.map((p:string)=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Honra Acumulada</label><input type="number" value={data.points} onChange={e=>setData({...data, points: Number(e.target.value)})} className="input-prestige" /></div>
      </div>
      <button onClick={()=>onUpdate(member.id, data)} className="w-full py-6 bg-red-600 text-white rounded-2xl font-black uppercase text-sm active:scale-95">Salvar Perfil</button>
    </div>
  );
};

const WarningForm = ({ members, onAdd }: any) => {
  const [data, setData] = useState({ memberId: '', memberName: '', reason: '', severity: 'Leve', date: new Date().toISOString().slice(0, 16) });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Operativo</label>
            <select value={data.memberId} onChange={e => {
              const m = members.find((x:any)=>x.id === e.target.value);
              setData({...data, memberId: e.target.value, memberName: m?.name || ''});
            }} className="input-prestige appearance-none">
              <option value="">SELECIONAR...</option>
              {members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Data da Infração</label><input type="datetime-local" value={data.date} onChange={e=>setData({...data, date: e.target.value})} className="input-prestige" /></div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Severidade</label>
        <select value={data.severity} onChange={e=>setData({...data, severity: e.target.value as any})} className="input-prestige appearance-none">
          <option value="Leve">ADVERTÊNCIA LEVE</option><option value="Média">SUSPENSÃO OPERACIONAL</option><option value="Grave">EXCLUSÃO DA FAMÍLIA</option>
        </select>
      </div>
      <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Relato dos Fatos</label><textarea value={data.reason} onChange={e=>setData({...data, reason: e.target.value})} className="input-prestige h-32 resize-none" /></div>
      <button onClick={()=>onAdd({...data, id: Date.now().toString()})} className="w-full py-6 bg-red-600 text-white rounded-2xl font-black uppercase text-sm active:scale-95">Aplicar Sentença</button>
    </div>
  );
};

const DossierView = ({ candidate, isSupremo, onApprove, onReject }: any) => (
  <div className="space-y-8">
    <div className="grid grid-cols-2 gap-4 text-center bg-black/40 p-6 rounded-3xl border border-white/5">
       <div className="space-y-1"><p className="text-[9px] text-zinc-500 uppercase font-black">Codinome</p><p className="text-lg font-black text-white">{candidate.name}</p></div>
       <div className="space-y-1"><p className="text-[9px] text-zinc-500 uppercase font-black">Idade</p><p className="text-lg font-black text-white">{candidate.age}</p></div>
       <div className="space-y-1"><p className="text-[9px] text-zinc-500 uppercase font-black">Aptidão</p><p className="text-[10px] font-black text-red-500 uppercase">{candidate.profession.split(' ')[0]}</p></div>
       <div className="space-y-1"><p className="text-[9px] text-zinc-500 uppercase font-black">Habilidade</p><p className="text-lg font-black text-white">{candidate.proficiencyLevel}/10</p></div>
    </div>
    <div className="space-y-4">
       <DossierItem label="Identificador Discord" value={candidate.contact} />
       <DossierItem label="Histórico Profissional" value={candidate.workHistory} />
       <DossierItem label="Principais Habilidades" value={candidate.specialSkills} />
       <DossierItem label="Objetivos Operacionais" value={candidate.orgGoal} />
       <DossierItem label="Disponibilidade" value={candidate.irregularHours} />
       <DossierItem label="Assinatura Digital" value={candidate.signature} />
       <DossierItem label="Data de Registro" value={new Date(candidate.date).toLocaleString()} />
    </div>
    {candidate.status === 'PENDING' && isSupremo && (
      <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
        <button onClick={onApprove} className="w-full py-6 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95">Recrutar Operativo</button>
        <button onClick={onReject} className="w-full py-4 border border-zinc-800 text-zinc-600 rounded-2xl font-black uppercase text-[9px] active:scale-95">Negar Dossiê</button>
      </div>
    )}
  </div>
);

const DossierItem = ({ label, value }: any) => (
  <div className="p-6 bg-zinc-950 rounded-[2rem] border border-white/5">
    <p className="text-[9px] text-red-500 font-black uppercase mb-2 tracking-widest">{label}</p>
    <p className="text-zinc-200 text-xs italic font-medium leading-relaxed">{value || 'SEM INFORMAÇÃO'}</p>
  </div>
);

export default AdminDashboard;
