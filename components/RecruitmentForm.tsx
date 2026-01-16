
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Candidate, CandidateStatus, Profession } from '../types.ts';
import { 
  ArrowRight, ArrowLeft, ChevronDown, 
  Skull, FileText, Fingerprint, Loader2, CheckCircle2,
  ShieldCheck, Brain, Clock, Zap, Target, Heart
} from 'lucide-react';

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1457049586303766792/ZRBa9vJCz6DDK_WKs3uC1JDR-uNL2R4cemiX-wdQzoSTn4kS_ABzdA2gPBdjW7HZ27LR";

interface Props {
  onSubmit: (candidate: Candidate) => void;
  onAdminAccess: () => void;
}

const RecruitmentForm: React.FC<Props> = ({ onSubmit, onAdminAccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Candidate>>({
    profession: "Executor (Combate)" as Profession,
    loyaltyLevel: "Total",
    proficiencyLevel: "5",
    testWillingness: "Sim",
    illegalWillingness: "Total",
    ambitionLevel: "Moderado",
    civilStatus: "Solteiro",
    nationality: "Brasileiro",
    secrecyCommitment: "Sim",
    irregularHours: "Noite",
    children: "Não",
    personalConflicts: "Nenhum",
    sacrificeInterest: "Sim",
    familyInOtherOrg: "Não",
    rulesCommitment: "Sim",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSealed, setIsSealed] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorField === name) setErrorField(null);
  };

  const validateStep = () => {
    const required: Record<number, string[]> = {
      1: ['name', 'contact', 'age', 'location', 'nationality'],
      2: ['profession', 'specialSkills', 'workHistory', 'proficiencyLevel'],
      3: ['motivation', 'orgGoal'],
      4: ['ambitionLevel', 'loyaltyLevel', 'personalConflicts'],
      5: ['irregularHours', 'secrecyCommitment'],
      6: ['signature']
    };
    const fields = required[step] || [];
    for (const f of fields) {
      if (!formData[f as keyof Candidate]) {
        setErrorField(f);
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    const fullData: Candidate = {
      id: Math.random().toString(36).substr(2, 9),
      status: CandidateStatus.PENDING,
      date: new Date().toISOString(),
      ...(formData as Candidate)
    };
    
    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "🩸 NOVO DOSSIÊ IMPERIAL 🩸",
            description: `Recruta **${fullData.name}** iniciou o juramento de sangue.`,
            color: 0xff3333,
            fields: [
              { name: "Operativo", value: fullData.name, inline: true },
              { name: "Especialidade", value: fullData.profession, inline: true },
              { name: "Localização", value: fullData.location, inline: true }
            ]
          }]
        })
      });
      setIsSealed(true);
      setTimeout(() => onSubmit(fullData), 3000);
    } catch {
      setIsSealed(true);
      setTimeout(() => onSubmit(fullData), 3000);
    }
  };

  const stepIcons = [null, <FileText size={32} />, <Target size={32} />, <Brain size={32} />, <Heart size={32} />, <ShieldCheck size={32} />, <Skull size={32} />];

  return (
    <div className="min-h-screen bg-black flex flex-col p-4 md:p-8 relative overflow-x-hidden mobile-safe-top mobile-safe-bottom">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <AnimatePresence mode="wait">
        {!isSealed ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto glass-panel rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative z-10 my-auto"
          >
            {/* Header Mobile Otimizado */}
            <div className="bg-[#0c0c0e] p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/40 text-red-500">
                  {stepIcons[step]}
                </div>
                <div>
                  <h1 className="font-cinzel text-lg md:text-2xl font-black tracking-widest text-white leading-tight">DOSSIÊ IMPERIAL</h1>
                  <p className="text-[10px] text-zinc-300 font-mono uppercase tracking-[0.3em]">Etapa {step} / 6</p>
                </div>
              </div>
              <button onClick={onAdminAccess} className="p-4 bg-zinc-900 rounded-2xl border border-white/10 text-zinc-400">
                <Fingerprint size={28} />
              </button>
            </div>

            {/* Content - Contraste Elevado */}
            <div className="p-6 md:p-12 overflow-y-auto max-h-[70vh] custom-scroll">
              <div className="space-y-8">
                {step === 1 && (
                  <div className="space-y-6">
                    <Input label="NOME DE GUERRA (RP)" name="name" value={formData.name} onChange={handleChange} error={errorField==='name'} placeholder="Seu Codinome" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="IDADE REAL" name="age" type="number" value={formData.age} onChange={handleChange} error={errorField==='age'} placeholder="Ex: 20" />
                      <Input label="IDENTIFICADOR" name="contact" value={formData.contact} onChange={handleChange} error={errorField==='contact'} placeholder="Discord" />
                    </div>
                    <Input label="CIDADE / LOCALIZAÇÃO" name="location" value={formData.location} onChange={handleChange} error={errorField==='location'} />
                    <Input label="NACIONALIDADE" name="nationality" value={formData.nationality} onChange={handleChange} error={errorField==='nationality'} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select label="ESTADO CIVIL" name="civilStatus" options={['Solteiro', 'Casado', 'Divorciado']} value={formData.civilStatus} onChange={handleChange} />
                      <Select label="TEM FILHOS?" name="children" options={['Não', 'Sim']} value={formData.children} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <Select label="ESPECIALIZAÇÃO" name="profession" options={['Executor (Combate)', 'Piloto (Fuga/Logística)', 'Hacker (Inteligência)', 'Negociador (Diplomacia)', 'Químico (Produção)']} value={formData.profession} onChange={handleChange} />
                    <Select label="PROFICIÊNCIA (0-10)" name="proficiencyLevel" options={['1','2','3','4','5','6','7','8','9','10']} value={formData.proficiencyLevel} onChange={handleChange} />
                    <TextArea label="ARSENAL DE HABILIDADES" name="specialSkills" value={formData.specialSkills} onChange={handleChange} error={errorField==='specialSkills'} placeholder="O que você sabe fazer de melhor?" />
                    <TextArea label="HISTÓRICO EM FACÇÕES" name="workHistory" value={formData.workHistory} onChange={handleChange} error={errorField==='workHistory'} placeholder="Onde já atuou?" />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <TextArea label="MOTIVAÇÃO REAL" name="motivation" value={formData.motivation} onChange={handleChange} error={errorField==='motivation'} placeholder="Por que a Imperivm?" />
                    <TextArea label="SUA AMBIÇÃO" name="orgGoal" value={formData.orgGoal} onChange={handleChange} error={errorField==='orgGoal'} placeholder="Onde quer chegar?" />
                    <Select label="DISPOSIÇÃO PARA ATOS ILEGAIS" name="illegalWillingness" options={['Total', 'Parcial', 'Nula']} value={formData.illegalWillingness} onChange={handleChange} />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="bg-red-500/10 p-5 rounded-xl border border-red-500/30">
                       <p className="text-xs text-zinc-200 font-bold uppercase tracking-widest mb-2">Aviso de Lealdade</p>
                       <p className="text-[11px] text-zinc-400 italic">"Ninguém entra se não estiver disposto a dar a vida."</p>
                    </div>
                    <Select label="GRAU DE LEALDADE" name="loyaltyLevel" options={['Total', 'Parcial']} value={formData.loyaltyLevel} onChange={handleChange} />
                    <Select label="SACRIFÍCIO PELA ORGANIZAÇÃO" name="sacrificeInterest" options={['Sim', 'Depende', 'Não']} value={formData.sacrificeInterest} onChange={handleChange} />
                    <TextArea label="CONFLITOS OU DÍVIDAS?" name="personalConflicts" value={formData.personalConflicts} onChange={handleChange} error={errorField==='personalConflicts'} placeholder="Há algo que devamos saber?" />
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <Select label="TURNO DE ATIVIDADE" name="irregularHours" options={['Manhã', 'Tarde', 'Noite', 'Madrugada', 'Integral']} value={formData.irregularHours} onChange={handleChange} />
                    <Select label="PACTO DE SIGILO (OMERTÀ)" name="secrecyCommitment" options={['Sim', 'Não']} value={formData.secrecyCommitment} onChange={handleChange} />
                    <Select label="DISPOSTO A TESTES?" name="testWillingness" options={['Sim', 'Não']} value={formData.testWillingness} onChange={handleChange} />
                    <TextArea label="DEFINA HONRA PARA VOCÊ" name="honorCode" value={formData.honorCode} onChange={handleChange} placeholder="O que é respeito no crime?" />
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-8 text-center py-6">
                    <Skull size={64} className="mx-auto text-red-600 animate-pulse" />
                    <h3 className="text-xl font-cinzel font-black text-white">JURAMENTO FINAL</h3>
                    <div className="p-6 bg-zinc-950 border-2 border-red-900/40 rounded-3xl text-xs text-zinc-300 leading-relaxed italic">
                      "Pela minha vida e honra, prometo silêncio absoluto, lealdade incondicional e coragem. O que a Imperivm une, ninguém separa."
                    </div>
                    <Input label="ASSINATURA (NOME COMPLETO RP)" name="signature" value={formData.signature} onChange={handleChange} error={errorField==='signature'} placeholder="Digite seu nome para selar" />
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Mobile Otimizada */}
            <div className="bg-[#0c0c0e] p-6 border-t border-white/10 flex justify-between items-center">
              {step > 1 ? (
                <button onClick={prevStep} className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[11px] px-4 py-3">
                  <ArrowLeft size={16} /> Voltar
                </button>
              ) : <div />}

              {step < 6 ? (
                <button 
                  onClick={nextStep} 
                  className="bg-red-600 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-red-900/20 active:scale-95"
                >
                  Próximo <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-white text-black px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Skull size={18} /> SELAR PACTO</>}
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="m-auto text-center space-y-8 p-6">
            <CheckCircle2 size={100} className="text-red-600 mx-auto" />
            <h2 className="text-4xl font-cinzel font-black text-white uppercase tracking-widest">Pacto Firmado</h2>
            <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest animate-pulse">Sua alma agora pertence à Família.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">{label}</label>
    <input {...props} className={`input-prestige ${error ? 'border-red-500 bg-red-500/10' : ''}`} />
  </div>
);

const TextArea = ({ label, error, ...props }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">{label}</label>
    <textarea {...props} rows={3} className={`input-prestige resize-none ${error ? 'border-red-500 bg-red-500/10' : ''}`} />
  </div>
);

const Select = ({ label, name, options, value, onChange }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className="input-prestige appearance-none pr-10">
        {options.map((o: string) => <option key={o} value={o} className="bg-[#0c0c0e] text-white">{o}</option>)}
      </select>
      <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  </div>
);

export default RecruitmentForm;
