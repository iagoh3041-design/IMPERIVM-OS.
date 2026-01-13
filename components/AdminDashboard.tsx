
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, LayoutDashboard, UserPlus, LogOut, X, Target, Menu, Edit2,
  Trash2, Crown, Landmark, ShieldCheck, Plus, TrendingUp, Clock, 
  Search, ShieldAlert, Award, Gavel, Skull, CheckCircle2, ChevronRight,
  TrendingDown, DollarSign, Activity, FileText, User, Lock, Database, Download, Upload, Calendar, AlertCircle
} from 'lucide-react';
import { Candidate, Member, RPAction, Transaction, Warning, CandidateStatus, Rank } from '../types';

interface Props {
  currentUser: { name: string, role: string };
  candidates: Candidate[];
  members: Member[];
  actions: RPAction[];
  finances: Transaction[];
  warnings: Warning[];
  onLogout: () => void;
  onApproveCandidate: (id: string) => void;
  onRejectCandidate: (id: string) => void;
  onDelete: (type: 'member' | 'action' | 'finance' | 'warning' | 'candidate', id: string) => void;
  onAddAction: (action: RPAction) => void;
  onAddTransaction: (t: Transaction) => void;
  onAddWarning: (w: Warning) => void;
  onUpdateMember: (m: Member) => void;
  onUpdateAction: (a: RPAction) => void;
  onUpdateFinance: (f: Transaction) => void;
  onUpdateWarning: (w: Warning) => void;
  onImportData: (data: any) => void;
}

const RANKS: Rank[] = ['Don Supremo', 'Sub-Don', 'Conselheiro', 'Capitão', 'Tenente', 'Soldado', 'Recruta', 'Associado', 'Afastado'];

const AdminDashboard: React.FC<Props> = ({ 
  currentUser, candidates = [], members = [], actions = [], finances = [], warnings = [], 
  onLogout, onApproveCandidate, onRejectCandidate, onDelete, 
  onAddAction, onAddTransaction, onAddWarning, onUpdateMember,
  onUpdateAction, onUpdateFinance, onUpdateWarning, onImportData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recruitment' | 'members' | 'actions' | 'finances' | 'punishments' | 'system'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState<'transaction' | 'action' | 'warning' | 'rank' | 'edit-member' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSupremo = currentUser.role === 'Don Supremo';

  const stats = useMemo(() => {
    const income = finances.filter(f => f.type === 'INCOME').reduce((acc, f) => acc + f.amount, 0);
    const expense = finances.filter(f => f.type === 'EXPENSE').reduce((acc, f) => acc + f.amount, 0);
    return { balance: income - expense, income, expense };
  }, [finances]);

  const formatDate = useCallback((isoString: string) => {
    if (!isoString) return "S/ Data";
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit' 
    });
  }, []);

  const handleExportBackup = () => {
    const backupData = { candidates, members, actions, finances, warnings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMPERIVM_DB_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm("SUBSTITUIR TODO O SISTEMA?")) onImportData(json);
      } catch (err) { alert("Arquivo corrompido."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredMembers = useMemo(() => 
    members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [members, searchTerm]);

  return (
    <div className="flex h-screen w-full bg-[#070708] text-[#e2e8f0] overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[140] lg:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#0d0e12] border-r border-white/5 flex flex-col z-[150] transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex flex-col h-full safe-pt">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-[#d4af37]/30">
              <Crown size={24} className="text-[#d4af37]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[10px] font-cinzel font-black text-white uppercase truncate tracking-widest">{currentUser.name}</h2>
              <p className="text-[8px] text-[#d4af37] font-black uppercase tracking-widest">{currentUser.role}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            <NavItem active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setIsMobileMenuOpen(false);}} icon={<LayoutDashboard size={18}/>} label="Operacional" />
            <NavItem active={activeTab === 'recruitment'} onClick={() => {setActiveTab('recruitment'); setIsMobileMenuOpen(false);}} icon={<UserPlus size={18}/>} label="Inteligência" badge={candidates.filter(c => c.status === CandidateStatus.PENDING).length} />
            <NavItem active={activeTab === 'members'} onClick={() => {setActiveTab('members'); setIsMobileMenuOpen(false);}} icon={<Users size={18}/>} label="Efetivo" />
            <NavItem active={activeTab === 'actions'} onClick={() => {setActiveTab('actions'); setIsMobileMenuOpen(false);}} icon={<Target size={18}/>} label="Ações RP" />
            <NavItem active={activeTab === 'finances'} onClick={() => {setActiveTab('finances'); setIsMobileMenuOpen(false);}} icon={<Landmark size={18}/>} label="Finanças" />
            <NavItem active={activeTab === 'punishments'} onClick={() => {setActiveTab('punishments'); setIsMobileMenuOpen(false);}} icon={<Gavel size={18}/>} label="Tribunal" />
            {isSupremo && <NavItem active={activeTab === 'system'} onClick={() => {setActiveTab('system'); setIsMobileMenuOpen(false);}} icon={<Database size={18}/>} label="Cofre" />}
          </nav>

          <button onClick={onLogout} className="mt-6 w-full py-3 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-all border border-white/5 flex items-center justify-center gap-2">
            <LogOut size={14} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070708] relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0e12]/80 z-50 safe-pt">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-zinc-400 bg-white/5 rounded-lg"><Menu size={20}/></button>
            <h1 className="text-[10px] font-cinzel font-black text-white uppercase tracking-[0.3em]">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className={`text-sm font-mono font-black ${stats.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>R$ {stats.balance.toLocaleString()}</p>
             </div>
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-[#d4af37]/20 shadow-lg shadow-[#d4af37]/5">
               <ShieldCheck size={20} className={isSupremo ? "text-[#d4af37]" : "text-zinc-700"} />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Membros" value={members.length} icon={<Users size={18}/>} />
                  <StatCard label="Ações" value={actions.length} icon={<Activity size={18}/>} />
                  <StatCard label="Saldo" value={`R$ ${stats.balance.toLocaleString()}`} icon={<Landmark size={18}/>} color={stats.balance >= 0 ? "text-emerald-500" : "text-red-500"} />
                  <StatCard label="Punições" value={warnings.length} icon={<ShieldAlert size={18}/>} color="text-red-500" />
                </div>
                
                <div className="glass-panel p-6 rounded-2xl">
                   <h3 className="text-[9px] font-black uppercase text-[#d4af37] tracking-widest mb-4 flex items-center gap-2"><Clock size={14}/> Últimas Movimentações</h3>
                   <div className="space-y-3">
                      {[...actions, ...finances].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((log: any) => (
                         <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                               <div className={`p-1.5 rounded-lg ${log.amount ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {log.amount ? <Landmark size={12}/> : <Target size={12}/>}
                               </div>
                               <div>
                                  <p className="text-[10px] font-bold text-white uppercase">{log.category || log.type}</p>
                                  <p className="text-[8px] text-zinc-600 font-black">{formatDate(log.date)}</p>
                               </div>
                            </div>
                            <p className="text-[10px] font-mono font-black text-white">{log.amount ? `R$ ${log.amount.toLocaleString()}` : 'AÇÃO'}</p>
                         </div>
                      ))}
                      {actions.length === 0 && finances.length === 0 && <EmptyState icon={<Database size={24}/>} text="Nenhum registro encontrado." />}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'recruitment' && (
              <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidates.filter(c => c.status === CandidateStatus.PENDING).map(c => (
                       <div key={c.id} className="glass-panel p-5 rounded-2xl border-white/5">
                          <div className="flex justify-between mb-4">
                             <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10"><User size={20} className="text-zinc-600"/></div>
                             <p className="text-[7px] text-zinc-600 font-black uppercase">{formatDate(c.date)}</p>
                          </div>
                          <h4 className="text-[12px] font-black text-white uppercase mb-1 truncate">{c.name}</h4>
                          <p className="text-[8px] text-[#d4af37] font-black uppercase mb-4">{c.profession}</p>
                          <div className="flex gap-2">
                             <button onClick={() => setSelectedCandidate(c)} className="flex-1 py-2 bg-white/5 text-zinc-400 rounded-lg text-[8px] font-black uppercase border border-white/5">Dossiê</button>
                             {isSupremo && <button onClick={() => onApproveCandidate(c.id)} className="flex-1 py-2 bg-[#d4af37] text-black rounded-lg text-[8px] font-black uppercase">Aprovar</button>}
                          </div>
                       </div>
                    ))}
                    {candidates.filter(c => c.status === CandidateStatus.PENDING).length === 0 && <div className="col-span-full py-16"><EmptyState icon={<UserPlus size={32}/>} text="Nenhum recrutamento pendente." /></div>}
                 </div>
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div key="mem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                   <div className="relative w-full max-w-xs">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="text" placeholder="BUSCAR SOLDADO..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111216] border border-white/10 rounded-lg pl-10 py-2.5 text-[9px] outline-none" />
                   </div>
                </div>
                <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto">
                   <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-[#111216] text-[8px] text-zinc-600 font-black uppercase">
                         <tr><th className="p-5">Identidade</th><th className="p-5">Patente</th><th className="p-5">Pontos</th><th className="p-5 text-right">Controle</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[10px] font-bold">
                         {filteredMembers.map(m => (
                            <tr key={m.id} className="hover:bg-white/5">
                               <td className="p-5 uppercase text-white tracking-wide truncate max-w-[150px]">{m.name}</td>
                               <td className="p-5">
                                 <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${m.role === 'Don Supremo' ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-zinc-400'}`}>{m.role}</span>
                               </td>
                               <td className="p-5 font-mono text-xs">{m.points.toLocaleString()}</td>
                               <td className="p-5 text-right space-x-1">
                                  {isSupremo ? (
                                    <>
                                       <button onClick={() => { setEditingItem(m); setShowAddModal('edit-member'); }} className="p-2 bg-white/5 text-zinc-500 hover:text-emerald-500 rounded-lg"><Edit2 size={12}/></button>
                                       <button onClick={() => { setEditingItem(m); setShowAddModal('rank'); }} className="p-2 bg-white/5 text-zinc-500 hover:text-[#d4af37] rounded-lg"><Award size={12}/></button>
                                       {m.role !== 'Don Supremo' && <button onClick={() => onDelete('member', m.id)} className="p-2 bg-white/5 text-zinc-500 hover:text-red-500 rounded-lg"><Trash2 size={12}/></button>}
                                    </>
                                  ) : <Lock size={12} className="inline-block opacity-20" />}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {/* Outras Abas Seguindo o Mesmo Padrão de Melhoria Mobile */}
            {activeTab === 'actions' && (
              <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                    <h2 className="text-[9px] font-black text-white uppercase tracking-widest">Relatório Criminal</h2>
                    <button onClick={() => { setEditingItem(null); setShowAddModal('action'); }} className="p-2.5 bg-red-700 text-white rounded-lg shadow-lg"><Plus size={18}/></button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {actions.map(a => (
                       <div key={a.id} className="glass-panel p-5 rounded-2xl relative">
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex flex-col gap-0.5">
                                <span className="px-2 py-0.5 bg-red-950/30 text-red-500 rounded text-[7px] font-black uppercase border border-red-900/20">{a.type}</span>
                                <span className="text-[7px] text-zinc-600 font-bold">{formatDate(a.date)}</span>
                             </div>
                             {isSupremo && (
                                <div className="flex gap-2">
                                   <button onClick={() => { setEditingItem(a); setShowAddModal('action'); }} className="p-1 text-zinc-600 hover:text-emerald-500"><Edit2 size={14}/></button>
                                   <button onClick={() => onDelete('action', a.id)} className="p-1 text-zinc-600 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                             )}
                          </div>
                          <p className="text-[11px] font-bold text-white uppercase italic leading-relaxed mb-4">"{a.description}"</p>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 bg-white/5 rounded-xl">
                                <p className="text-[7px] text-zinc-600 uppercase font-black mb-1">Loot</p>
                                <p className="text-sm font-mono font-black text-emerald-500">R$ {a.loot.toLocaleString()}</p>
                             </div>
                             <div className="p-3 bg-white/5 rounded-xl truncate">
                                <p className="text-[7px] text-zinc-600 uppercase font-black mb-1">Equipe</p>
                                <p className="text-[8px] text-zinc-400 font-bold truncate">{a.participants || 'N/A'}</p>
                             </div>
                          </div>
                       </div>
                    ))}
                    {actions.length === 0 && <div className="col-span-full py-16"><EmptyState icon={<Target size={32}/>} text="Nenhuma ação no arquivo." /></div>}
                 </div>
              </motion.div>
            )}

            {activeTab === 'finances' && (
               <motion.div key="fin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                     <h2 className="text-[9px] font-black text-white uppercase tracking-widest">Contabilidade Central</h2>
                     <button onClick={() => { setEditingItem(null); setShowAddModal('transaction'); }} className="p-2.5 bg-emerald-700 text-white rounded-lg shadow-lg"><Plus size={18}/></button>
                  </div>
                  <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto">
                     <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-[#111216] text-[8px] text-zinc-600 font-black uppercase">
                           <tr><th className="p-5">Data</th><th className="p-5">Descrição</th><th className="p-5 text-right">Valor</th><th className="p-5 text-right">Gestão</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[10px] font-bold">
                           {finances.map(f => (
                              <tr key={f.id} className="hover:bg-white/5">
                                 <td className="p-5 text-zinc-600 font-mono text-[8px]">{formatDate(f.date)}</td>
                                 <td className="p-5">
                                    <p className="text-white uppercase truncate max-w-[150px]">{f.category}</p>
                                    <p className="text-[7px] text-zinc-600 uppercase truncate max-w-[150px]">{f.description}</p>
                                 </td>
                                 <td className={`p-5 text-right font-mono text-sm ${f.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {f.type === 'INCOME' ? '+' : '-'} R$ {f.amount.toLocaleString()}
                                 </td>
                                 <td className="p-5 text-right">
                                    {isSupremo && (
                                       <div className="flex justify-end gap-2">
                                          <button onClick={() => { setEditingItem(f); setShowAddModal('transaction'); }} className="p-1 text-zinc-600 hover:text-emerald-500"><Edit2 size={14}/></button>
                                          <button onClick={() => onDelete('finance', f.id)} className="p-1 text-zinc-600 hover:text-red-500"><Trash2 size={14}/></button>
                                       </div>
                                    )}
                                 </td>
                              </tr>
                           ))}
                           {finances.length === 0 && <tr><td colSpan={4} className="p-16 text-center"><EmptyState icon={<Landmark size={32}/>} text="Nenhum fluxo de caixa." /></td></tr>}
                        </tbody>
                     </table>
                  </div>
               </motion.div>
            )}

            {activeTab === 'punishments' && (
               <motion.div key="pun" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                     <h2 className="text-[9px] font-black text-white uppercase tracking-widest">Corregedoria</h2>
                     <button onClick={() => { setEditingItem(null); setShowAddModal('warning'); }} className="p-2.5 bg-zinc-800 text-[#d4af37] rounded-lg border border-[#d4af37]/20 shadow-lg"><Plus size={18}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {warnings.map(w => (
                        <div key={w.id} className="glass-panel p-5 rounded-2xl relative">
                           <div className="flex justify-between mb-4">
                              <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${w.severity === 'Grave' ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-400'}`}>{w.severity}</span>
                              <p className="text-[7px] text-zinc-700 font-black">{formatDate(w.date)}</p>
                           </div>
                           <div className="flex items-center gap-3 mb-3">
                              <Skull size={14} className="text-red-900"/>
                              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{w.memberName}</h4>
                           </div>
                           <p className="text-[9px] text-zinc-500 italic border-l border-zinc-800 pl-3 mb-4">"{w.reason}"</p>
                           {isSupremo && (
                              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                                 <button onClick={() => { setEditingItem(w); setShowAddModal('warning'); }} className="text-zinc-600 hover:text-emerald-500"><Edit2 size={14}/></button>
                                 <button onClick={() => onDelete('warning', w.id)} className="text-zinc-600 hover:text-red-500"><Trash2 size={14}/></button>
                              </div>
                           )}
                        </div>
                     ))}
                     {warnings.length === 0 && <div className="col-span-full py-16"><EmptyState icon={<Gavel size={32}/>} text="Limpo de sentenças." /></div>}
                  </div>
               </motion.div>
            )}

            {activeTab === 'system' && isSupremo && (
               <motion.div key="sys" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-[10px] font-cinzel font-black text-white uppercase tracking-widest">Sincronismo do Cofre</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center space-y-6">
                        <Download size={40} className="text-[#d4af37] opacity-20"/>
                        <p className="text-[9px] text-zinc-500 uppercase">Gere um backup total criptografado.</p>
                        <button onClick={handleExportBackup} className="w-full py-4 bg-[#d4af37] text-black rounded-xl font-black text-[9px] uppercase">Exportar Backup (.JSON)</button>
                     </div>
                     <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center space-y-6 border-red-900/10">
                        <Upload size={40} className="text-red-500 opacity-20"/>
                        <p className="text-[9px] text-zinc-500 uppercase">Restaurar base de dados externa.</p>
                        <input type="file" ref={fileInputRef} onChange={handleImportBackup} className="hidden" accept=".json" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-red-800 text-white rounded-xl font-black text-[9px] uppercase">Importar Arquivo</button>
                     </div>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* MODALS UNIFICADOS COM DATA/HORA */}
      <AnimatePresence>
        {/* FINANCEIRO */}
        {showAddModal === 'transaction' && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
              <motion.div className="w-full max-w-sm glass-panel p-8 rounded-3xl">
                 <div className="flex justify-between mb-8">
                    <h2 className="text-[9px] font-cinzel font-black text-white uppercase tracking-widest">{editingItem ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
                    <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="text-zinc-500"><X size={18}/></button>
                 </div>
                 <form onSubmit={(e: any) => {
                    e.preventDefault();
                    const d = new FormData(e.target);
                    const payload = { 
                      id: editingItem?.id || Date.now().toString(), 
                      type: d.get('type') as any, 
                      amount: Number(d.get('amount')), 
                      category: d.get('cat') as string, 
                      description: d.get('desc') as string || '', 
                      date: d.get('date') ? new Date(d.get('date') as string).toISOString() : new Date().toISOString()
                    };
                    editingItem ? onUpdateFinance(payload) : onAddTransaction(payload);
                    setShowAddModal(null); setEditingItem(null);
                 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <select name="type" defaultValue={editingItem?.type || "INCOME"} className="input-prestige w-full text-[9px] font-black"><option value="INCOME">ENTRADA</option><option value="EXPENSE">SAÍDA</option></select>
                       <input name="amount" type="number" defaultValue={editingItem?.amount || ""} placeholder="R$ 0,00" className="input-prestige w-full text-[9px] font-mono" required />
                    </div>
                    <input name="cat" defaultValue={editingItem?.category || ""} placeholder="CATEGORIA (DROGAS, VENDAS...)" className="input-prestige w-full text-[9px] font-bold" required />
                    <input name="date" type="datetime-local" defaultValue={editingItem?.date ? new Date(editingItem.date).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)} className="input-prestige w-full text-[9px] font-mono" />
                    <button type="submit" className="w-full py-4 bg-emerald-700 text-white rounded-xl font-black text-[9px] uppercase shadow-lg">Confirmar</button>
                 </form>
              </motion.div>
           </div>
        )}

        {/* OPERAÇÃO */}
        {showAddModal === 'action' && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95">
              <motion.div className="w-full max-w-sm glass-panel p-8 rounded-3xl">
                 <div className="flex justify-between mb-8">
                    <h2 className="text-[9px] font-cinzel font-black text-white uppercase">Relato de Ação</h2>
                    <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="text-zinc-500"><X size={18}/></button>
                 </div>
                 <form onSubmit={(e: any) => {
                    e.preventDefault();
                    const d = new FormData(e.target);
                    const payload = { 
                      id: editingItem?.id || Date.now().toString(), 
                      type: d.get('type') as string, 
                      description: d.get('desc') as string, 
                      loot: Number(d.get('loot')), 
                      success: true, 
                      participants: d.get('parts') as string, 
                      date: d.get('date') ? new Date(d.get('date') as string).toISOString() : new Date().toISOString()
                    };
                    editingItem ? onUpdateAction(payload) : onAddAction(payload);
                    setShowAddModal(null); setEditingItem(null);
                 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <input name="type" defaultValue={editingItem?.type || ""} placeholder="TIPO" className="input-prestige w-full text-[9px] font-black uppercase" required />
                       <input name="loot" defaultValue={editingItem?.loot || ""} type="number" placeholder="LOOT R$" className="input-prestige w-full text-[9px] font-mono" required />
                    </div>
                    <textarea name="desc" defaultValue={editingItem?.description || ""} placeholder="RESUMO DOS FATOS..." className="input-prestige w-full text-[9px] h-16 resize-none" required />
                    <input name="date" type="datetime-local" defaultValue={editingItem?.date ? new Date(editingItem.date).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)} className="input-prestige w-full text-[9px] font-mono" />
                    <button type="submit" className="w-full py-4 bg-red-700 text-white rounded-xl font-black text-[9px] uppercase">Arquivar</button>
                 </form>
              </motion.div>
           </div>
        )}

        {/* EDIÇÃO MEMBRO / RANK (Simplificado para Mobile) */}
        {showAddModal === 'edit-member' && isSupremo && editingItem && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95">
            <motion.div className="w-full max-w-sm glass-panel p-8 rounded-3xl">
               <div className="flex justify-between mb-8">
                  <h2 className="text-[9px] font-cinzel font-black text-white uppercase">Editar Ficha</h2>
                  <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="text-zinc-500"><X size={18}/></button>
               </div>
               <form onSubmit={(e: any) => {
                 e.preventDefault();
                 const d = new FormData(e.target);
                 onUpdateMember({ ...editingItem, name: d.get('name') as string, points: Number(d.get('pts')) });
                 setShowAddModal(null); setEditingItem(null);
               }} className="space-y-4">
                  <input name="name" defaultValue={editingItem.name} className="input-prestige w-full text-[10px] font-bold" />
                  <input name="pts" type="number" defaultValue={editingItem.points} className="input-prestige w-full text-[10px] font-mono" />
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-black rounded-xl font-black text-[9px] uppercase">Salvar</button>
               </form>
            </motion.div>
          </div>
        )}

        {/* PUNIÇÃO */}
        {showAddModal === 'warning' && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95">
              <motion.div className="w-full max-w-sm glass-panel p-8 rounded-3xl">
                 <div className="flex justify-between mb-8">
                    <h2 className="text-[9px] font-cinzel font-black text-white uppercase tracking-widest">Sentenciar Soldado</h2>
                    <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="text-zinc-500"><X size={18}/></button>
                 </div>
                 <form onSubmit={(e: any) => {
                    e.preventDefault();
                    const d = new FormData(e.target);
                    const mem = members.find(m => m.id === d.get('member'));
                    const payload = { 
                      id: editingItem?.id || Date.now().toString(), 
                      memberId: d.get('member') as string, 
                      memberName: mem?.name || editingItem?.memberName || '', 
                      reason: d.get('reason') as string, 
                      severity: d.get('sev') as any, 
                      date: d.get('date') ? new Date(d.get('date') as string).toISOString() : new Date().toISOString()
                    };
                    editingItem ? onUpdateWarning(payload) : onAddWarning(payload);
                    setShowAddModal(null); setEditingItem(null);
                 }} className="space-y-4">
                    <select name="member" defaultValue={editingItem?.memberId} className="input-prestige w-full text-[9px] font-black">{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                    <select name="sev" defaultValue={editingItem?.severity || "Leve"} className="input-prestige w-full text-[9px] font-black"><option value="Leve">ADVERTÊNCIA</option><option value="Média">SUSPENSÃO</option><option value="Grave">EXECUÇÃO</option></select>
                    <textarea name="reason" defaultValue={editingItem?.reason} placeholder="MOTIVO..." className="input-prestige w-full text-[9px] h-16 resize-none" required />
                    <input name="date" type="datetime-local" defaultValue={editingItem?.date ? new Date(editingItem.date).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)} className="input-prestige w-full text-[9px] font-mono" />
                    <button type="submit" className="w-full py-4 bg-zinc-800 text-[#d4af37] rounded-xl font-black text-[9px] uppercase border border-[#d4af37]/20">Confirmar</button>
                 </form>
              </motion.div>
           </div>
        )}
        
        {/* RANK/PATENTE */}
        {showAddModal === 'rank' && isSupremo && editingItem && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95">
              <motion.div className="w-full max-w-xs glass-panel p-6 rounded-3xl">
                 <div className="flex justify-between mb-6">
                    <h2 className="text-[9px] font-cinzel font-black text-white uppercase">Sentença de Patente</h2>
                    <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="text-zinc-500"><X size={18}/></button>
                 </div>
                 <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {RANKS.map(r => (
                       <button key={r} onClick={() => {onUpdateMember({...editingItem, role: r}); setShowAddModal(null); setEditingItem(null);}} className={`w-full p-3 rounded-lg text-[8px] font-black uppercase text-left transition-all ${editingItem.role === r ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>{r}</button>
                    ))}
                 </div>
              </motion.div>
           </div>
        )}

        {/* DETALHES CANDIDATO */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 overflow-y-auto safe-pt pb-20">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl glass-panel p-8 rounded-3xl border-[#d4af37]/10 relative">
                <div className="flex justify-between items-start mb-10">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-[#d4af37]/20"><User size={32} className="text-[#d4af37]"/></div>
                      <div>
                        <h2 className="text-lg font-cinzel font-black text-white uppercase truncate">{selectedCandidate.name}</h2>
                        <p className="text-[8px] text-[#d4af37] font-black uppercase mt-1">{selectedCandidate.profession}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedCandidate(null)} className="p-3 bg-white/5 rounded-xl text-zinc-500 hover:text-white"><X size={24}/></button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pb-10">
                   <DossierItem label="Idade" value={selectedCandidate.age} />
                   <DossierItem label="Contato" value={selectedCandidate.contact} />
                   <DossierItem label="Setor" value={selectedCandidate.location} />
                   <div className="col-span-full border-t border-white/5 pt-6 space-y-4">
                      <DossierItem label="Habilidades" value={selectedCandidate.specialSkills} />
                      <DossierItem label="Histórico RP" value={selectedCandidate.workHistory} />
                      <DossierItem label="Motivação" value={selectedCandidate.motivation} />
                      <DossierItem label="Lealdade" value={selectedCandidate.loyaltyLevel} />
                   </div>
                </div>

                <div className="sticky bottom-0 left-0 right-0 pt-6 bg-gradient-to-t from-[#0d0e12] to-transparent flex gap-3">
                   {isSupremo ? (
                     <>
                        <button onClick={() => { onRejectCandidate(selectedCandidate.id); setSelectedCandidate(null); }} className="flex-1 py-4 bg-red-950/20 text-red-500 rounded-xl text-[8px] font-black uppercase border border-red-900/30">Incinerar</button>
                        <button onClick={() => { onApproveCandidate(selectedCandidate.id); setSelectedCandidate(null); }} className="flex-[2] py-4 bg-emerald-600 text-black rounded-xl text-[8px] font-black uppercase shadow-lg">Consagrar Membro</button>
                     </>
                   ) : <div className="w-full p-4 bg-white/5 text-center text-[8px] font-black uppercase text-zinc-700 tracking-widest">Acesso Restrito ao Don Supremo</div>}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyState = ({ icon, text }: any) => (
  <div className="flex flex-col items-center justify-center py-6 opacity-20">
     <div className="mb-2">{icon}</div>
     <p className="text-[8px] font-black uppercase tracking-widest">{text}</p>
  </div>
);

const DossierItem = ({ label, value }: any) => (
  <div className="border-b border-white/5 pb-2">
    <p className="text-[7px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-[9px] text-white font-bold">{value || 'N/A'}</p>
  </div>
);

const NavItem = ({ active, onClick, icon, label, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 group ${active ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/10' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-3">
      <span className={active ? 'text-black' : 'text-zinc-700 group-hover:text-[#d4af37]'}>{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    {badge > 0 && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${active ? 'bg-black text-[#d4af37]' : 'bg-red-600 text-white'}`}>{badge}</span>}
  </button>
);

const StatCard = ({ label, value, icon, color = "text-white" }: any) => (
  <div className="glass-panel p-4 rounded-xl border-white/5 bg-[#0d0e12]/40">
    <div className="flex justify-between items-start mb-3">
      <div className="p-1.5 bg-white/5 rounded-lg text-zinc-700 group-hover:text-[#d4af37] transition-colors">{icon}</div>
      <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
    </div>
    <p className={`text-xs font-mono font-black ${color} truncate`}>{value}</p>
  </div>
);

export default AdminDashboard;
