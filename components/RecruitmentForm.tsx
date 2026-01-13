
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Candidate, CandidateStatus } from '../types.ts';
import { 
  Fingerprint, CheckCircle2, User, Target, Skull, 
  Send, ShieldAlert, Heart, Scroll, AlertCircle,
  ArrowRight, ArrowLeft, ShieldCheck
} from 'lucide-react';

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1457049586303766792/ZRBa9vJCz6DDK_WKs3uC1JDR-uNL2R4cemiX-wdQzoSTn4kS_ABzdA2gPBdjW7HZ27LR";

interface Props {
  onSubmit: (candidate: Candidate) => void;
  onAdminAccess: () => void;
}

const RecruitmentForm: React.FC<Props> = ({ onSubmit, onAdminAccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    areasExperience: [],
    proficiencyLevel: "5",
    profession: "Executor (Combate)",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({
        ...prev,
        areasExperience: checked 
          ? [...(prev.areasExperience || []), value]
          : prev.areasExperience.filter((i: string) => i !== value)
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };
  const prevStep = () => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fullData: Candidate = {
      id: Math.random().toString(36).substr(2, 9),
      status: CandidateStatus.PENDING,
      date: new Date().toISOString(),
      ...formData
    };
    
    // Log Discord
    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "🩸 NOVO PACTO DE SANGUE",
            color: 0xd4af37,
            fields: [
              { name: "👤 Nome", value: fullData.name || "Não informado", inline: true },
              { name: "🎯 Cargo", value: fullData.profession, inline: true },
              { name: "📞 Discord", value: fullData.contact || "Não informado", inline: true }
            ],
            footer: { text: "Imperivm High Command" }
          }]
        })
      });
    } catch(e) {}

    onSubmit(fullData);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] text-center border-[#d4af37]/20">
          <ShieldCheck size={64} className="text-[#d4af37] mx-auto mb-6" />
          <h2 className="font-cinzel text-xl font-black text-white mb-4 uppercase tracking-widest">Alistamento Enviado</h2>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed mb-8">
            Seu dossiê está em análise. Se você for digno, entraremos em contato. <br/>Não nos procure.
          </p>
          <button onClick={() => location.reload()} className="w-full py-5 bg-[#d4af37] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest">VOLTAR AO INÍCIO</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 pb-32 px-4 bg-[#0a0a0c] relative">
      <div className="scanline"></div>
      
      <div className="w-full max-w-2xl relative z-20">
        <header className="text-center mb-10">
          <motion.div whileTap={{ scale: 0.9 }} onClick={onAdminAccess} className="w-16 h-16 bg-[#111216] rounded-2xl mx-auto flex items-center justify-center border border-[#d4af37]/20 mb-6 cursor-pointer">
            <Fingerprint className="w-8 h-8 text-[#d4af37]" />
          </motion.div>
          <h1 className="font-cinzel text-3xl font-black text-white tracking-[0.3em] uppercase">Imperivm</h1>
          <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-3">Elite Command Operations</p>
        </header>

        <motion.div layout className="glass-panel p-6 md:p-12 rounded-[2.5rem] border-white/5 relative">
          <div className="absolute top-0 left-0 h-1.5 bg-[#d4af37] transition-all duration-500" style={{ width: `${(step/6)*100}%` }}></div>
          
          <form className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <SectionTitle icon={<User size={18}/>} text="I. Identificação Civil" />
                  <Field label="1. Nome Completo" name="name" required value={formData.name || ''} onChange={handleChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="2. Idade" name="age" type="number" required value={formData.age || ''} onChange={handleChange} />
                    <Field label="3. Contato (Discord)" name="contact" required value={formData.contact || ''} onChange={handleChange} />
                  </div>
                  <Field label="4. Localização/Setor" name="location" required value={formData.location || ''} onChange={handleChange} />
                  <Field label="5. Nacionalidade" name="nationality" value={formData.nationality || ''} onChange={handleChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="6. Estado Civil" name="civilStatus" value={formData.civilStatus || ''} onChange={handleChange} />
                    <Field label="7. Filhos (Quantos?)" name="children" value={formData.children || ''} onChange={handleChange} />
                  </div>
                  <StepActions onNext={nextStep} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <SectionTitle icon={<Target size={18}/>} text="II. Capacidades Operacionais" />
                  <Area label="8. Habilidades Especiais" name="specialSkills" value={formData.specialSkills || ''} onChange={handleChange} placeholder="O que te torna indispensável?" />
                  <Area label="9. Histórico Profissional (RP)" name="workHistory" value={formData.workHistory || ''} onChange={handleChange} />
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">10. Áreas de Experiência</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Combate', 'Armas', 'Logística', 'Hacking', 'Diplomacia'].map(area => (
                        <label key={area} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                          <input type="checkbox" value={area} onChange={handleChange} checked={formData.areasExperience?.includes(area)} className="w-4 h-4 accent-[#d4af37]" />
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Select label="11. Nível de Proficiência (1-10)" name="proficiencyLevel" value={formData.proficiencyLevel || '5'} options={['1','2','3','4','5','6','7','8','9','10']} onChange={handleChange} />
                  <Field label="12. Certificações/Treinos" name="certifications" value={formData.certifications || ''} onChange={handleChange} />
                  <StepActions onNext={nextStep} onPrev={prevStep} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <SectionTitle icon={<Heart size={18}/>} text="III. Ambição e Foco" />
                  <Area label="13. Por que o Cartel Imperial?" name="motivation" required value={formData.motivation || ''} onChange={handleChange} />
                  <Field label="14. Qual seu objetivo final?" name="orgGoal" value={formData.orgGoal || ''} onChange={handleChange} />
                  <Field label="15. Disposto a atos ilegais?" name="illegalWillingness" value={formData.illegalWillingness || ''} onChange={handleChange} placeholder="Sim/Não" />
                  <Area label="16. Conflitos de Interesse" name="personalConflicts" value={formData.personalConflicts || ''} onChange={handleChange} />
                  <Select label="17. Nível de Ambição" name="ambitionLevel" value={formData.ambitionLevel || 'Baixo'} options={['Baixo','Médio','Alto','Implacável']} onChange={handleChange} />
                  <StepActions onNext={nextStep} onPrev={prevStep} />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <SectionTitle icon={<ShieldAlert size={18}/>} text="IV. Protocolo de Lealdade" />
                  <Select label="19. Nível de Lealdade Estimado" name="loyaltyLevel" options={['Parcial','Total','Absoluta']} value={formData.loyaltyLevel || 'Parcial'} onChange={handleChange} />
                  <Field label="20. Segue ordens contra a lei?" name="rulesCommitment" value={formData.rulesCommitment || ''} onChange={handleChange} />
                  <Field label="21. Sacrificaria interesses próprios?" name="sacrificeInterest" value={formData.sacrificeInterest || ''} onChange={handleChange} />
                  <Field label="22. Parentes em outras orgs?" name="familyInOtherOrg" value={formData.familyInOtherOrg || ''} onChange={handleChange} />
                  <Field label="23. Aceita teste de lealdade letal?" name="testWillingness" value={formData.testWillingness || ''} onChange={handleChange} />
                  <StepActions onNext={nextStep} onPrev={prevStep} />
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <SectionTitle icon={<AlertCircle size={18}/>} text="V. Disposições Finais" />
                  <Area label="25. Código de Honra Pessoal" name="honorCode" value={formData.honorCode || ''} onChange={handleChange} />
                  <Field label="26. Manterá segredo absoluto?" name="secrecyCommitment" value={formData.secrecyCommitment || ''} onChange={handleChange} />
                  <Field label="28. Disponibilidade (Horários)" name="irregularHours" value={formData.irregularHours || ''} onChange={handleChange} />
                  <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                    <p className="text-[9px] text-red-500 font-black uppercase text-center leading-relaxed">
                      AO ENVIAR, VOCÊ ACEITA AS CONSEQUÊNCIAS DE QUALQUER TRAIÇÃO. O CARTEL NÃO PERDOA.
                    </p>
                  </div>
                  <StepActions onNext={nextStep} onPrev={prevStep} />
                </motion.div>
              )}

              {step === 6 && (
                <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 text-center pb-10">
                  <SectionTitle icon={<Scroll size={18}/>} text="VI. Selamento do Pacto" />
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-zinc-400 uppercase font-bold leading-relaxed">
                    Declaro que todas as informações acima são verdadeiras. Assino com meu nome operacional.
                  </div>
                  <Field label="Assinatura Operacional" name="signature" required value={formData.signature || ''} onChange={handleChange} placeholder="Nome e Sobrenome" />
                  <div className="flex flex-col gap-4">
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full py-6 bg-[#d4af37] text-black rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                      {isSubmitting ? "Criptografando..." : <><Skull size={20} /> SELAR PACTO DE SANGUE</>}
                    </button>
                    <button type="button" onClick={prevStep} className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Revisar Dossier</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, text }: any) => (
  <div className="flex items-center gap-4 border-b border-white/5 pb-5">
    <div className="p-2.5 bg-[#d4af37] text-black rounded-xl shadow-lg">{icon}</div>
    <h3 className="text-sm font-cinzel font-black uppercase tracking-widest text-white">{text}</h3>
  </div>
);

const Field = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{label}</label>
    <input {...props} className="input-prestige w-full text-[11px] font-bold" />
  </div>
);

const Area = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{label}</label>
    <textarea {...props} rows={3} className="input-prestige w-full text-[11px] font-bold resize-none" />
  </div>
);

const Select = ({ label, options, name, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{label}</label>
    <select name={name} value={value} onChange={onChange} className="input-prestige w-full bg-[#1a1b21] text-[11px] font-bold">
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const StepActions = ({ onNext, onPrev }: any) => (
  <div className="flex justify-between items-center pt-8 border-t border-white/5">
    {onPrev ? (
      <button type="button" onClick={onPrev} className="flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all">
        <ArrowLeft size={16} /> Voltar
      </button>
    ) : <div/>}
    {onNext && (
      <button type="button" onClick={onNext} className="flex items-center gap-2 px-10 py-4 bg-[#d4af37] text-black rounded-xl text-[10px] font-black uppercase shadow-xl">
        Avançar <ArrowRight size={16} />
      </button>
    )}
  </div>
);

export default RecruitmentForm;
