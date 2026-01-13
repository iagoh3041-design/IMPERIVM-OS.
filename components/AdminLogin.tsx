
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ChevronRight, Lock, Fingerprint } from 'lucide-react';

interface Props {
  onSuccess: (user: { name: string, role: string }) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulação de Descriptografia de Segurança
    await new Promise(resolve => setTimeout(resolve, 1200));

    const validUsers = [
      { u: 'iago', p: '2005', r: 'Don Supremo' },
      { u: 'krozz', p: '11082010', r: 'Sub-Don' }
    ];

    const found = validUsers.find(entry => entry.u === user.toLowerCase() && entry.p === pass);

    if (found) {
      onSuccess({ name: found.u, role: found.r });
    } else {
      setError('ACESSO NEGADO: FALHA NA CHAVE DE CRIPTOGRAFIA');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#070708] relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#d4af37]/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#d4af37]/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-10 md:p-14 rounded-[3rem] relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-[#111216] rounded-3xl mx-auto flex items-center justify-center mb-8 border border-[#d4af37]/20 shadow-2xl gold-glow">
            <Fingerprint className="text-[#d4af37] w-12 h-12" />
          </div>
          <h2 className="font-cinzel text-2xl text-white uppercase tracking-[0.4em] font-black">Imperivm OS</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-3">Terminal de Comando Central</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Usuário</label>
            </div>
            <input 
              required 
              type="text" 
              value={user} 
              onChange={(e) => setUser(e.target.value)} 
              placeholder="IDENTIFICADOR" 
              className="input-prestige w-full text-xs font-mono" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Senha Mestra</label>
            <div className="relative">
              <input 
                required 
                type={showPass ? "text" : "password"} 
                value={pass} 
                onChange={(e) => setPass(e.target.value)} 
                placeholder="••••••••" 
                className="input-prestige w-full text-xs font-mono" 
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#d4af37] transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl text-center">
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

          <div className="pt-6 flex flex-col gap-4">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-5 bg-[#d4af37] text-black rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl gold-glow active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>Iniciar Sessão <ChevronRight size={18} /></>
              )}
            </button>
            <button 
              type="button" 
              onClick={onCancel} 
              className="w-full py-4 text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Abortar e Voltar
            </button>
          </div>
        </form>
      </motion.div>
      
      <div className="absolute bottom-10 text-[9px] text-zinc-800 font-black uppercase tracking-[0.5em]">
        Imperivm Secure Assets • encrypted v4.5.1
      </div>
    </div>
  );
};

export default AdminLogin;
