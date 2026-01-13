
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, LayoutDashboard, UserPlus, LogOut, X, Target, Menu, Edit2,
  Trash2, Crown, Landmark, ShieldCheck, Plus, TrendingUp, Clock, 
  Search, ShieldAlert, Award, Gavel, Skull, CheckCircle2, ChevronRight,
  TrendingDown, DollarSign, Activity, FileText, User, Lock, Database, Download, Upload, Calendar
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

  // Otimização de Estatísticas
  const stats = useMemo(() => {
    const income = finances.filter(f => f.type === 'INCOME').reduce((acc, f) => acc + f.amount, 0);
    const expense = finances.filter(f => f.type === 'EXPENSE').reduce((acc, f) => acc + f.amount, 0);
    return { balance: income - expense, income, expense };
  }, [finances]);

  // Formatação de Data amigável
  const formatDate = useCallback((isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit' 
    });
  }, []);

  const handleExportBackup = () => {
    const backupData = { candidates, members, actions, finances, warnings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMPERIVM_DB_${new Date().toISOString().replace(/:/g, '-')}.json`;
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
        if (confirm("ATENÇÃO: Isso irá substituir todos os dados atuais. Confirmar?")) {
          onImportData(json);
        }
      } catch (err) { alert("Arquivo inválido."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredMembers = useMemo(() => 
    members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [members, searchTerm]);

  return (
    <div className="flex h-screen w-full bg-[#070708] text-[#e2e8f0] overflow-hidden">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-md z-[140] lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-[#0d0e12] border-r border-white/5 flex flex-col z-[150] transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1a1b21] to-[#0d0e12] rounded-2xl flex items-center justify-center border border-[#d4af37]/40 shadow-2xl shadow-[#d4af37]/10">
              <Crown size={28} className="text-[#d4af37]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[12px] font-cinzel font-black text-white uppercase truncate tracking-widest">{currentUser.name}</h2>
              <p className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest opacity-80">{currentUser.role}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            <NavItem active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setIsMobileMenuOpen(false);}} icon={<LayoutDashboard size={20}/>} label="Operacional" />
            <NavItem active={activeTab === 'recruitment'} onClick={() => {setActiveTab('recruitment'); setIsMobileMenuOpen(false);}} icon={<UserPlus size={20}/>} label="Inteligência" badge={candidates.filter(c => c.status === CandidateStatus.PENDING).length} />
            <NavItem active={activeTab === 'members'} onClick={() => {setActiveTab('members'); setIsMobileMenuOpen(false);}} icon={<Users size={20}/>} label="Membros" />
            <NavItem active={activeTab === 'actions'} onClick={() => {setActiveTab('actions'); setIsMobileMenuOpen(false);}} icon={<Target size={20}/>} label="Relatório RP" />
            <NavItem active={activeTab === 'finances'} onClick={() => {setActiveTab('finances'); setIsMobileMenuOpen(false);}} icon={<Landmark size={20}/>} label="Tesouraria" />
            <NavItem active={activeTab === 'punishments'} onClick={() => {setActiveTab('punishments'); setIsMobileMenuOpen(false);}} icon={<Gavel size={20}/>} label="Corregedoria" />
            {isSupremo && <NavItem active={activeTab === 'system'} onClick={() => {setActiveTab('system'); setIsMobileMenuOpen(false);}} icon={<Database size={20}/>} label="Sistema" />}
          </nav>

          <button onClick={onLogout} className="mt-8 w-full py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 hover:bg-red-500/5 flex items-center justify-center gap-3 transition-all border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> Encerrar Conexão
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#070708] relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 md:px-12 bg-[#0d0e12]/40 backdrop-blur-2xl z-50">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 text-zinc-400 bg-white/5 rounded-2xl border border-white/10"><Menu size={24}/></button>
            <div className="hidden sm:block">
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Módulo Ativo</p>
              <h1 className="text-sm font-cinzel font-black text-white uppercase tracking-[0.2em]">{activeTab}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Tesouro Imperial</p>
                <p className={`text-lg font-mono font-black ${stats.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>R$ {stats.balance.toLocaleString()}</p>
             </div>
             <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl flex items-center justify-center border border-[#d4af37]/30 shadow-lg shadow-[#d4af37]/5">
               {isSupremo ? <ShieldCheck size={24} className="text-[#d4af37]" /> : <Lock size={24} className="text-zinc-700" />}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 pb-40 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Efetivo Total" value={members.length} icon={<Users size={22}/>} />
                  <StatCard label="Operações" value={actions.length} icon={<Activity size={22}/>} />
                  <StatCard label="Receita Bruta" value={`R$ ${stats.income.toLocaleString()}`} icon={<TrendingUp size={22}/>} color="text-emerald-500" />
                  <StatCard label="Ações Disciplinares" value={warnings.length} icon={<Skull size={22}/>} color="text-red-500" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                      <h3 className="text-[11px] font-black uppercase text-[#d4af37] tracking-[0.3em] mb-8 flex items-center gap-3"><Clock size={16}/> Logs Recentes</h3>
                      <div className="space-y-6">
                         {[...actions, ...finances].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((log: any) => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                               <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded-lg ${log.amount ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                     {log.amount ? <Landmark size={14}/> : <Target size={14}/>}
                                  </div>
                                  <div>
                                     <p className="text-[11px] font-bold text-white uppercase">{log.category || log.type}</p>
                                     <p className="text-[9px] text-zinc-600 font-black">{formatDate(log.date)}</p>
                                  </div>
                               </div>
                               <p className="text-[11px] font-mono font-black text-white">
                                  {log.amount ? `R$ ${log.amount.toLocaleString()}` : log.description.substring(0, 15) + '...'}
                                </p>
                            </div>
                         ))}
                         {actions.length === 0 && finances.length === 0 && (
                            <p className="text-[10px] text-zinc-700 uppercase font-black text-center py-10">Aguardando inteligência...</p>
                         )}
                      </div>
                   </div>

                   <div className="glass-panel p-10 rounded-[3rem] border-white/5 flex flex-col justify-center items-center text-center">
                      <ShieldCheck size={64} className="text-zinc-800 mb-6" />
                      <h4 className="text-[12px] font-cinzel font-black text-white uppercase tracking-widest mb-2">Sistema Operacional Estável</h4>
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Todos os setores sob controle do Don Supremo</p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'recruitment' && (
              <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                 <div className="flex justify-between items-center">
                    <h2 className="text-sm font-cinzel font-black text-white uppercase tracking-widest">Dossiês de Alistamento</h2>
                    <span className="px-4 py-1.5 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-black rounded-full border border-[#d4af37]/20 uppercase">{candidates.filter(c => c.status === CandidateStatus.PENDING).length} pendentes</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {candidates.filter(c => c.status === CandidateStatus.PENDING).map(c => (
                       <div key={c.id} className="glass-panel p-8 rounded-[2.5rem] border-white/5 hover:border-[#d4af37]/30 transition-all group">
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#d4af37]/20 transition-all"><User size={28} className="text-zinc-600 group-hover:text-[#d4af37]"/></div>
                             <p className="text-[9px] text-zinc-500 font-black uppercase">{formatDate(c.date)}</p>
                          </div>
                          <h4 className="text-[14px] font-black text-white uppercase tracking-wide mb-1">{c.name}</h4>
                          <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest mb-8">{c.profession}</p>
                          <div className="flex gap-3">
                             <button onClick={() => setSelectedCandidate(c)} className="flex-1 py-4 bg-white/5 text-zinc-400 rounded-2xl text-[10px] font-black uppercase hover:text-white transition-all border border-white/5">Dossiê</button>
                             {isSupremo && <button onClick={() => onApproveCandidate(c.id)} className="flex-1 py-4 bg-emerald-600 text-black rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-emerald-500 transition-all">Aprovar</button>}
                          </div>
                       </div>
                    ))}
                    {candidates.filter(c => c.status === CandidateStatus.PENDING).length === 0 && (
                       <div className="col-span-full py-24 text-center glass-panel rounded-[3rem] border-white/5">
                          <CheckCircle2 size={48} className="mx-auto text-zinc-800 mb-4" />
                          <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Nenhum dossiê aguardando análise.</p>
                       </div>
                    )}
                 </div>
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div key="mem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <h2 className="text-sm font-cinzel font-black text-white uppercase tracking-widest">Controle de Efetivo</h2>
                   <div className="relative w-full md:w-80">
                      <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="text" placeholder="BUSCAR SOLDADO..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 py-4 text-[11px] font-bold outline-none focus:border-[#d4af37]/40 transition-all" />
                   </div>
                </div>
                <div className="glass-panel rounded-[3rem] overflow-hidden border-white/5">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-[#111216] text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                            <tr>
                               <th className="p-8">Identidade</th>
                               <th className="p-8">Patente</th>
                               <th className="p-8">Pontuação</th>
                               <th className="p-8 text-right">Controle</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5 text-[12px] font-bold">
                            {filteredMembers.map(m => (
                               <tr key={m.id} className="hover:bg-white/5 transition-all">
                                  <td className="p-8">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-600 font-black">{m.name[0]}</div>
                                        <div>
                                           <p className="text-white uppercase tracking-wide">{m.name}</p>
                                           <p className="text-[9px] text-zinc-600 uppercase font-black">{m.profession}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-black tracking-widest ${m.role === 'Don Supremo' ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>{m.role}</span></td>
                                  <td className="p-8 font-mono text-zinc-400 text-lg">{m.points.toLocaleString()}</td>
                                  <td className="p-8 text-right space-x-3">
                                     {isSupremo ? (
                                       <>
                                          <button onClick={() => { setEditingItem(m); setShowAddModal('edit-member'); }} className="p-3 bg-white/5 text-zinc-500 hover:text-emerald-500 rounded-xl border border-white/10 transition-all"><Edit2 size={18}/></button>
                                          <button onClick={() => { setEditingItem(m); setShowAddModal('rank'); }} className="p-3 bg-white/5 text-zinc-500 hover:text-[#d4af37] rounded-xl border border-white/10 transition-all"><Award size={18}/></button>
                                          <button onClick={() => onDelete('member', m.id)} className="p-3 bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border border-red-900/30 transition-all"><Trash2 size={18}/></button>
                                       </>
                                     ) : <Lock size={18} className="text-zinc-800 inline-block" />}
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'actions' && (
              <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                 <div className="flex justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-md">
                    <div>
                       <h2 className="text-sm font-cinzel font-black text-white uppercase tracking-widest">Relatório de Operações</h2>
                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Histórico de ações criminosas e logísticas</p>
                    </div>
                    <button onClick={() => { setEditingItem(null); setShowAddModal('action'); }} className="p-5 bg-red-700 text-white rounded-2xl shadow-xl shadow-red-900/20 hover:bg-red-600 transition-all"><Plus size={28}/></button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {actions.map(a => (
                       <div key={a.id} className="glass-panel p-8 rounded-[3rem] border-white/5 relative overflow-hidden group">
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-3">
                                <span className="px-4 py-1.5 bg-red-950/40 text-red-500 rounded-xl text-[9px] font-black uppercase border border-red-900/30 tracking-widest">{a.type}</span>
                                <span className="text-[9px] text-zinc-600 font-black uppercase flex items-center gap-2"><Calendar size={12}/> {formatDate(a.date)}</span>
                             </div>
                             {isSupremo && (
                                <div className="flex gap-2 relative z-10">
                                   <button onClick={() => { setEditingItem(a); setShowAddModal('action'); }} className="p-2 text-zinc-600 hover:text-emerald-500 transition-colors"><Edit2 size={16}/></button>
                                   <button onClick={() => onDelete('action', a.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                </div>
                             )}
                          </div>
                          <h4 className="text-[12px] font-black text-white uppercase mb-6 leading-relaxed italic border-l-2 border-[#d4af37]/30 pl-4">"{a.description}"</h4>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Loot Coletado</p>
                                <p className="text-lg font-mono font-black text-emerald-500">R$ {a.loot.toLocaleString()}</p>
                             </div>
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Envolvidos</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase truncate">{a.participants || 'Nenhum'}</p>
                             </div>
                          </div>
                       </div>
                    ))}
                    {actions.length === 0 && (
                       <div className="col-span-full py-32 text-center glass-panel rounded-[3rem] border-white/5">
                          <Target size={48} className="mx-auto text-zinc-900 mb-6" />
                          <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.3em]">Nenhuma operação registrada no banco central.</p>
                       </div>
                    )}
                 </div>
              </motion.div>
            )}

            {activeTab === 'finances' && (
               <motion.div key="fin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/10">
                     <div>
                        <h2 className="text-sm font-cinzel font-black text-white uppercase tracking-widest">Tesouraria Central</h2>
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Fluxo de caixa e lavagem de capitais</p>
                     </div>
                     <button onClick={() => { setEditingItem(null); setShowAddModal('transaction'); }} className="p-5 bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-900/20 hover:bg-emerald-600 transition-all"><Plus size={28}/></button>
                  </div>
                  <div className="glass-panel rounded-[3rem] overflow-hidden border-white/5">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-[#111216] text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                              <tr>
                                 <th className="p-8">Data e Hora</th>
                                 <th className="p-8">Categoria</th>
                                 <th className="p-8 text-right">Montante</th>
                                 <th className="p-8 text-right">Gestão</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 text-[12px] font-bold">
                              {finances.map(f => (
                                 <tr key={f.id} className="hover:bg-white/5 transition-all">
                                    <td className="p-8">
                                       <div className="flex items-center gap-3">
                                          <Clock size={14} className="text-zinc-600"/>
                                          <span className="text-zinc-500 font-mono">{formatDate(f.date)}</span>
                                       </div>
                                    </td>
                                    <td className="p-8">
                                       <div>
                                          <p className="text-white uppercase tracking-wider">{f.category}</p>
                                          <p className="text-[9px] text-zinc-600 uppercase font-black">{f.description}</p>
                                       </div>
                                    </td>
                                    <td className={`p-8 text-right font-mono text-lg ${f.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                                       {f.type === 'INCOME' ? '+' : '-'} R$ {f.amount.toLocaleString()}
                                    </td>
                                    <td className="p-8 text-right space-x-3">
                                       {isSupremo && (
                                          <>
                                             <button onClick={() => { setEditingItem(f); setShowAddModal('transaction'); }} className="p-2 text-zinc-600 hover:text-emerald-500 transition-colors"><Edit2 size={18}/></button>
                                             <button onClick={() => onDelete('finance', f.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                          </>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                              {finances.length === 0 && (
                                 <tr><td colSpan={4} className="p-20 text-center text-[10px] font-black uppercase text-zinc-800 tracking-widest">Nenhuma transação financeira detectada.</td></tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'punishments' && (
               <motion.div key="pun" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/10">
                     <div>
                        <h2 className="text-sm font-cinzel font-black text-white uppercase tracking-widest">Tribunal Disciplinar</h2>
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Correção e sentenças da corregedoria</p>
                     </div>
                     <button onClick={() => { setEditingItem(null); setShowAddModal('warning'); }} className="p-5 bg-zinc-800 text-[#d4af37] rounded-2xl border border-[#d4af37]/20 shadow-xl hover:bg-zinc-700 transition-all"><Plus size={28}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {warnings.map(w => (
                        <div key={w.id} className="glass-panel p-8 rounded-[3rem] border-red-900/10 hover:border-red-900/40 transition-all relative">
                           <div className="flex justify-between items-center mb-8">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${w.severity === 'Grave' ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>{w.severity}</span>
                              <div className="flex items-center gap-3">
                                 <p className="text-[9px] text-zinc-700 font-black uppercase">{formatDate(w.date)}</p>
                                 {isSupremo && (
                                    <div className="flex gap-2">
                                       <button onClick={() => { setEditingItem(w); setShowAddModal('warning'); }} className="p-2 text-zinc-600 hover:text-emerald-500 transition-colors"><Edit2 size={16}/></button>
                                       <button onClick={() => onDelete('warning', w.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                 )}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <Skull size={18} className="text-red-900"/>
                                 <h4 className="text-[14px] font-black text-white uppercase tracking-wider">{w.memberName}</h4>
                              </div>
                              <p className="text-[11px] text-zinc-500 italic leading-relaxed border-l border-zinc-800 pl-4">"{w.reason}"</p>
                           </div>
                        </div>
                     ))}
                     {warnings.length === 0 && (
                        <div className="col-span-full py-32 text-center glass-panel rounded-[3rem] border-white/5">
                           <ShieldAlert size={48} className="mx-auto text-zinc-900 mb-6" />
                           <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.3em]">Nenhuma sentença proferida recentemente.</p>
                        </div>
                     )}
                  </div>
               </motion.div>
            )}

            {activeTab === 'system' && isSupremo && (
               <motion.div key="sys" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <h2 className="text-sm font-cinzel font-black text-white uppercase tracking-widest">Cofre de Inteligência (Backup)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="glass-panel p-10 rounded-[4rem] border-[#d4af37]/10 flex flex-col items-center text-center space-y-8 bg-gradient-to-br from-[#d4af37]/5 to-transparent">
                        <div className="w-20 h-20 bg-[#d4af37]/10 rounded-3xl flex items-center justify-center border border-[#d4af37]/20 text-[#d4af37] shadow-inner shadow-[#d4af37]/5"><Download size={40}/></div>
                        <div>
                           <h3 className="text-[14px] font-black text-white uppercase tracking-widest">Exportar Base Imperivm</h3>
                           <p className="text-[10px] text-zinc-500 mt-3 uppercase tracking-wide leading-relaxed">Cria um arquivo criptografado contendo todos os membros, finanças e registros de inteligência.</p>
                        </div>
                        <button onClick={handleExportBackup} className="w-full py-5 bg-[#d4af37] text-black rounded-2xl font-black text-[11px] uppercase shadow-2xl gold-glow active:scale-95 transition-all">Download Backup SND</button>
                     </div>
                     <div className="glass-panel p-10 rounded-[4rem] border-red-900/10 flex flex-col items-center text-center space-y-8 bg-gradient-to-br from-red-900/5 to-transparent">
                        <div className="w-20 h-20 bg-red-950/20 rounded-3xl flex items-center justify-center border border-red-900/30 text-red-500"><Upload size={40}/></div>
                        <div>
                           <h3 className="text-[14px] font-black text-white uppercase tracking-widest">Restaurar do Cofre</h3>
                           <p className="text-[10px] text-zinc-500 mt-3 uppercase tracking-wide leading-relaxed">Carrega uma base de dados externa. **Atenção**: isso irá apagar todos os dados atuais do terminal.</p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImportBackup} className="hidden" accept=".json" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-5 bg-red-700 text-white rounded-2xl font-black text-[11px] uppercase shadow-2xl active:scale-95 transition-all">Upload e Sincronizar</button>
                     </div>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* SISTEMA DE MODAIS (EDIÇÃO UNIVERSAL) */}
      <AnimatePresence>
        {/* MODAL DE EDIÇÃO/PROMOÇÃO DE MEMBRO */}
        {showAddModal === 'edit-member' && isSupremo && editingItem && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/98 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md glass-panel p-10 md:p-14 rounded-[4rem] border-[#d4af37]/20 shadow-2xl">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-[12px] font-cinzel font-black text-white uppercase tracking-widest">Terminal de Dossiê</h2>
                    <p className="text-[9px] text-zinc-600 font-black uppercase mt-1">ID: {editingItem.id}</p>
                  </div>
                  <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
               </div>
               <form onSubmit={(e: any) => {
                 e.preventDefault();
                 const d = new FormData(e.target);
                 onUpdateMember({ ...editingItem, name: d.get('name') as string, points: Number(d.get('pts')) });
                 setShowAddModal(null); setEditingItem(null);
               }} className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Codinome Operacional</label>
                     <input name="name" defaultValue={editingItem.name} className="input-prestige w-full text-[12px] font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Pontos de Patente</label>
                     <input name="pts" type="number" defaultValue={editingItem.points} className="input-prestige w-full text-[12px] font-mono font-black" />
                  </div>
                  <button type="submit" className="w-full py-6 bg-emerald-600 text-black rounded-2xl font-black text-[11px] uppercase shadow-2xl hover:bg-emerald-500 transition-all">Sincronizar Dossiê</button>
                  <p className="text-[8px] text-zinc-700 text-center uppercase font-black">Alterações auditadas pelo High Command</p>
               </form>
            </motion.div>
          </div>
        )}

        {/* MODAL DE RANK (PROMOÇÃO) */}
        {showAddModal === 'rank' && isSupremo && editingItem && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/98 backdrop-blur-xl">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[4rem] border-[#d4af37]/20">
                 <div className="flex justify-between items-center mb-10">
                    <h2 className="text-[12px] font-cinzel font-black text-white uppercase tracking-widest">Sentença de Patente</h2>
                    <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
                 </div>
                 <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {RANKS.map(r => (
                       <button key={r} onClick={() => {onUpdateMember({...editingItem, role: r}); setShowAddModal(null); setEditingItem(null);}} className={`w-full p-5 rounded-2xl text-[10px] font-black uppercase text-left transition-all border ${editingItem.role === r ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/20 hover:text-white'}`}>{r}</button>
                    ))}
                 </div>
              </motion.div>
           </div>
        )}

        {/* MODAL FINANCEIRO (ADICIONAR/EDITAR) */}
        {showAddModal === 'transaction' && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/98 backdrop-blur-xl">
              <motion.div className="w-full max-w-md glass-panel p-10 rounded-[4rem] border-white/10">
                 <div className="flex justify-between items-center mb-10">
                    <h2 className="text-[12px] font-cinzel font-black text-white uppercase tracking-widest">{editingItem ? 'Retificar Lançamento' : 'Novo Lançamento SND'}</h2>
                    <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
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
                 }} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                       <select name="type" defaultValue={editingItem?.type || "INCOME"} className="input-prestige w-full text-[11px] font-black"><option value="INCOME">ENTRADA (+)</option><option value="EXPENSE">SAÍDA (-)</option></select>
                       <input name="amount" type="number" defaultValue={editingItem?.amount || ""} placeholder="R$ VALOR" className="input-prestige w-full text-[11px] font-mono font-black" required />
                    </div>
                    <input name="cat" defaultValue={editingItem?.category || ""} placeholder="CATEGORIA (VENDAS, DROGAS, ARMAS...)" className="input-prestige w-full text-[11px] font-bold" required />
                    <textarea name="desc" defaultValue={editingItem?.description || ""} placeholder="DETALHES ADICIONAIS..." className="input-prestige w-full text-[11px] font-bold h-24 resize-none" />
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Data e Hora do Registro</label>
                       <input name="date" type="datetime-local" defaultValue={editingItem?.date ? new Date(editingItem.date).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)} className="input-prestige w-full text-[11px] font-mono" />
                    </div>
                    <button type="submit" className="w-full py-6 bg-emerald-700 text-white rounded-2xl font-black text-[11px] uppercase shadow-2xl hover:bg-emerald-600 transition-all">{editingItem ? 'Salvar Alteração' : 'Efetuar Lançamento'}</button>
                 </form>
              </motion.div>
           </div>
        )}

        {/* MODAL DE OPERAÇÕES (ADICIONAR/EDITAR) */}
        {showAddModal === 'action' && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/98 backdrop-blur-xl">
              <motion.div className="w-full max-w-lg glass-panel p-10 md:p-14 rounded-[4rem] border-white/10">
                 <div className="flex justify-between items-center mb-10">
                    <h2 className="text-[12px] font-cinzel font-black text-white uppercase tracking-widest">{editingItem ? 'Editar Dossiê Operacional' : 'Registrar Operação RP'}</h2>
                    <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
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
                 }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <input name="type" defaultValue={editingItem?.type || ""} placeholder="TIPO (ASSALTO, INVASÃO...)" className="input-prestige w-full text-[11px] font-black uppercase" required />
                       <input name="loot" defaultValue={editingItem?.loot || ""} type="number" placeholder="LOOT R$" className="input-prestige w-full text-[11px] font-mono font-black" required />
                    </div>
                    <textarea name="desc" defaultValue={editingItem?.description || ""} placeholder="RELATÓRIO DOS FATOS..." className="input-prestige w-full text-[11px] font-bold h-24 resize-none" required />
                    <input name="parts" defaultValue={editingItem?.participants || ""} placeholder="NOMES DOS PARTICIPANTES (Separe por vírgula)" className="input-prestige w-full text-[11px] font-bold" />
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Início da Operação</label>
                       <input name="date" type="datetime-local" defaultValue={editingItem?.date ? new Date(editingItem.date).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)} className="input-prestige w-full text-[11px] font-mono" />
                    </div>
                    <button type="submit" className="w-full py-6 bg-red-700 text-white rounded-2xl font-black text-[11px] uppercase shadow-2xl hover:bg-red-600 transition-all">Sincronizar Arquivos</button>
                 </form>
              </motion.div>
           </div>
        )}

        {/* MODAL DISCIPLINAR (ADICIONAR/EDITAR) */}
        {showAddModal === 'warning' && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/98 backdrop-blur-xl">
              <motion.div className="w-full max-w-md glass-panel p-10 rounded-[4rem] border-white/10">
                 <div className="flex justify-between items-center mb-10">
                    <h2 className="text-[12px] font-cinzel font-black text-white uppercase tracking-widest">{editingItem ? 'Retificar Sentença' : 'Sentenciar Soldado'}</h2>
                    <button onClick={() => {setShowAddModal(null); setEditingItem(null);}} className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
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
                 }} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Soldado Acusado</label>
                       <select name="member" defaultValue={editingItem?.memberId} className="input-prestige w-full text-[11px] font-black">{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Gravidade do Ato</label>
                       <select name="sev" defaultValue={editingItem?.severity || "Leve"} className="input-prestige w-full text-[11px] font-black"><option value="Leve">ADVERTÊNCIA (LEVE)</option><option value="Média">SUSPENSÃO (MÉDIA)</option><option value="Grave">EXECUÇÃO / BAN (GRAVE)</option></select>
                    </div>
                    <textarea name="reason" defaultValue={editingItem?.reason} placeholder="MOTIVO DA SENTENÇA DISCIPLINAR..." className="input-prestige w-full text-[11px] font-bold h-24 resize-none" required />
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Data e Hora da Sentença</label>
                       <input name="date" type="datetime-local" defaultValue={editingItem?.date ? new Date(editingItem.date).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)} className="input-prestige w-full text-[11px] font-mono" />
                    </div>
                    <button type="submit" className="w-full py-6 bg-zinc-800 text-[#d4af37] rounded-2xl font-black text-[11px] uppercase border border-[#d4af37]/20 shadow-2xl hover:bg-zinc-700 transition-all">Registrar Sentença</button>
                 </form>
              </motion.div>
           </div>
        )}

        {/* DETALHES COMPLETOS DO CANDIDATO */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/98 overflow-y-auto py-20 backdrop-blur-3xl">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl glass-panel p-10 md:p-16 rounded-[4rem] border-[#d4af37]/10 relative">
                <div className="flex justify-between items-start mb-16">
                   <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#1a1b21] to-[#0d0e12] rounded-3xl flex items-center justify-center border border-[#d4af37]/20 text-[#d4af37] shadow-xl"><User size={48}/></div>
                      <div>
                        <h2 className="text-3xl font-cinzel font-black text-white uppercase tracking-wider mb-2">{selectedCandidate.name}</h2>
                        <p className="text-[12px] text-[#d4af37] font-black uppercase tracking-[0.4em]">{selectedCandidate.profession}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedCandidate(null)} className="p-5 bg-white/5 rounded-2xl text-zinc-500 hover:text-white border border-white/5 transition-all"><X size={32}/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 pb-16">
                   <DossierItem label="Idade" value={selectedCandidate.age} />
                   <DossierItem label="Setor" value={selectedCandidate.location} />
                   <DossierItem label="Contato" value={selectedCandidate.contact} />
                   <DossierItem label="Civil" value={selectedCandidate.civilStatus} />
                   <DossierItem label="Filhos" value={selectedCandidate.children} />
                   <DossierItem label="Proficiência" value={selectedCandidate.proficiencyLevel + '/10'} />
                   <div className="col-span-full border-t border-white/5 pt-10">
                      <h5 className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6">Capacidades e Ambição</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <DossierItem label="Habilidades" value={selectedCandidate.specialSkills} />
                         <DossierItem label="Histórico Profissional" value={selectedCandidate.workHistory} />
                         <DossierItem label="Motivação SND" value={selectedCandidate.motivation} />
                         <DossierItem label="Objetivo Final" value={selectedCandidate.orgGoal} />
                         <DossierItem label="Lealdade" value={selectedCandidate.loyaltyLevel} />
                         <DossierItem label="Comprometimento" value={selectedCandidate.rulesCommitment} />
                      </div>
                   </div>
                </div>

                <div className="sticky bottom-0 left-0 right-0 pt-10 bg-gradient-to-t from-[#0d0e12] to-transparent flex gap-6">
                   {isSupremo ? (
                     <>
                        <button onClick={() => { onRejectCandidate(selectedCandidate.id); setSelectedCandidate(null); }} className="flex-1 py-6 bg-red-950/30 text-red-500 rounded-3xl text-[11px] font-black uppercase border border-red-900/40 hover:bg-red-900/20 transition-all">Incinerar Dossiê</button>
                        <button onClick={() => { onApproveCandidate(selectedCandidate.id); setSelectedCandidate(null); }} className="flex-[2] py-6 bg-emerald-600 text-black rounded-3xl text-[11px] font-black uppercase shadow-2xl gold-glow hover:bg-emerald-500 transition-all">Consagrar Membro</button>
                     </>
                   ) : <div className="w-full p-6 bg-white/5 text-center text-[11px] font-black uppercase text-zinc-600 rounded-2xl border border-white/5 tracking-widest">Leitura Confidencial ao Don Supremo</div>}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DossierItem = ({ label, value }: any) => (
  <div className="border-b border-white/5 pb-4">
    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 opacity-60">{label}</p>
    <p className="text-[12px] text-white font-bold leading-relaxed tracking-wide">{value || 'NÃO INFORMADO'}</p>
  </div>
);

const NavItem = ({ active, onClick, icon, label, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group ${active ? 'bg-[#d4af37] text-black shadow-2xl shadow-[#d4af37]/20 scale-105' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-5">
      <span className={active ? 'text-black' : 'text-zinc-700 group-hover:text-[#d4af37] transition-colors'}>{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    {badge > 0 && <span className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-lg ${active ? 'bg-black text-[#d4af37]' : 'bg-red-600 text-white'}`}>{badge}</span>}
  </button>
);

const StatCard = ({ label, value, icon, color = "text-white" }: any) => (
  <div className="glass-panel p-8 rounded-[3rem] border-white/5 group hover:border-[#d4af37]/20 transition-all bg-gradient-to-br from-white/5 to-transparent">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3.5 bg-white/5 rounded-2xl text-zinc-700 group-hover:text-[#d4af37] border border-white/10 transition-all group-hover:scale-110">{icon}</div>
      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{label}</span>
    </div>
    <p className={`text-2xl font-mono font-black ${color} tracking-tight`}>{value}</p>
  </div>
);

export default AdminDashboard;
