
export enum CandidateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type Rank = 
  | 'Don Supremo' 
  | 'Sub-Don' 
  | 'Conselheiro' 
  | 'Capitão' 
  | 'Tenente' 
  | 'Soldado' 
  | 'Recruta' 
  | 'Associado' 
  | 'Afastado';

export type Profession = 
  | 'Executor (Combate)' 
  | 'Piloto (Fuga/Logística)' 
  | 'Hacker (Inteligência)' 
  | 'Negociador (Diplomacia)' 
  | 'Químico (Produção)';

export interface Candidate {
  id: string;
  name: string;
  age: string;
  contact: string;
  location: string;
  nationality: string;
  civilStatus: string;
  children: string;
  specialSkills: string;
  workHistory: string;
  areasExperience: string[];
  proficiencyLevel: string;
  certifications: string;
  motivation: string;
  orgGoal: string;
  illegalWillingness: string;
  personalConflicts: string;
  ambitionLevel: string;
  loyaltyLevel: string;
  rulesCommitment: string;
  sacrificeInterest: string;
  familyInOtherOrg: string;
  testWillingness: string;
  honorCode: string;
  secrecyCommitment: string;
  irregularHours: string;
  signature: string;
  date: string;
  status: CandidateStatus;
  profession: Profession;
}

export interface Member {
  id: string;
  name: string;
  role: Rank;
  profession: Profession;
  points: number;
  status: 'Ativo' | 'Inativo' | 'Reserva';
  joinedAt: string;
}

export interface RPAction {
  id: string;
  type: string;
  description: string;
  participants: string; // Mudado para string para facilitar edição rápida
  success: boolean;
  loot: number;
  date: string; // ISO String com Hora
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  date: string; // ISO String com Hora
}

export interface Warning {
  id: string;
  memberId: string;
  memberName: string;
  reason: string;
  severity: 'Leve' | 'Média' | 'Grave';
  date: string; // ISO String com Hora
}
