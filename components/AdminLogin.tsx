
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldAlert, Loader2, ChevronRight, Zap } from 'lucide-react';

interface Props {
  onSuccess: (user: { name: string, role: string }) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pass) return;
    
    setIsScanning(true);
    setError('');
    
    await new Promise(r => setTimeout(r, 2000));

    const valid = [
      { u: 'iago', p: '2005', r: 'Don Supremo' },
      { u: 'krozz', p: '11082010', r: 'Sub-Don' }
    ];

    const found = valid.find(x => x.u === user.toLowerCase() && x.p === pass);

    if (found) {
      onSuccess({ name: found.u, role: found.r });
    } else {
      setError('IDENTIDADE NÃO RECONHECIDA');
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.2)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-12 relative z-10"
      >
        <div className="text-center space-y-8">
          <div className="relative w-48 h-48 mx-auto cursor-pointer group" onClick={() => !isScanning && setIsScanning(true)}>
            {/* Outer Glow Ring */}
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.2, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 border-2 border-red-500/30 rounded-full" 
            />
            
            {/* Digital Container */}
            <div className={`absolute inset-4 rounded-full border-4 transition-all duration-700 flex items-center justify-center shadow-2xl ${isScanning ? 'border-red-500 bg-red-900/20 shadow-red-500/40' : 'border-zinc-800 bg-zinc-950 hover:border-red-500/30'}`}>
              <Fingerprint size={96} className={`${isScanning ? 'text-red-500 animate-pulse' : 'text-zinc-600 group-hover:text-zinc-400 transition-colors'}`} />
            </div>

            {/* Red Scanning Line */}
            {isScanning && <div className="scanner-line rounded-full" />}
          </div>
          
          <div className="space-y-3">
            <h2 className="font-cinzel text-5xl font-black tracking-widest text-white drop-shadow-lg">IMPERIVM</h2>
            <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-[0.6em] flex items-center justify-center gap-3">
              <Zap size={10} className="text-red-500 fill-red-500"/> COMANDO CENTRAL <Zap size={10} className="text-red-500 fill-red-500"/>
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 bg-zinc-900/80 p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-3xl">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Operativo</label>
              <input 
                required
                disabled={isScanning}
                type="text" 
                placeholder="USUÁRIO" 
                value={user}
                onChange={e => setUser(e.target.value)}
                className="input-prestige text-center tracking-widest font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Chave Mestra</label>
              <input 
                required
                disabled={isScanning}
                type="password" 
                placeholder="SENHA" 
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="input-prestige text-center tracking-widest font-mono"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 justify-center text-red-500 bg-red-500/10 py-4 rounded-2xl border border-red-500/20">
                <ShieldAlert size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 space-y-4">
            <button 
              disabled={isScanning}
              className="w-full py-6 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-sm font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-red-600/30 active:scale-95"
            >
              {isScanning ? <Loader2 className="animate-spin" /> : <>AUTENTICAR <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" /></>}
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.4em] py-2"
            >
              RETORNAR AO ALISTAMENTO
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
