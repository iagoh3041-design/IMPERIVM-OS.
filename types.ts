
export enum CandidateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type Rank = 
  | 'Don Supremo' | 'Sub-Don' | 'Conselheiro' | 'Capitão' 
  | 'Tenente' | 'Soldado' | 'Recruta' | 'Associado' | 'Afastado';

export type Profession = 
  | 'Executor (Combate)' | 'Piloto (Fuga/Logística)' 
  | 'Hacker (Inteligência)' | 'Negociador (Diplomacia)' | 'Químico (Produção)';

export interface Achievement {
  id: string;
  icon: string;
  label: string;
  description: string;
}

export interface Candidate {
  id: string;
  name: string;
  age: string;
  contact: string;
  location: string;
  nationality: string;
  civilStatus: string;
  children: string;
  profession: Profession;
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
}

export interface Member {
  id: string;
  name: string;
  role: Rank;
  profession: Profession;
  points: number;
  status: 'Ativo' | 'Inativo' | 'Reserva';
  joinedAt: string;
  achievements?: string[]; // IDs de Achievement
  metadata?: {
    lastEditedBy?: string;
    editDate?: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Armamento' | 'Munição' | 'Veículo' | 'Ilegal';
  quantity: number;
  assignedTo?: string; // ID do Membro
}

export interface RPAction {
  id: string;
  type: string;
  description: string;
  participants: string;
  success: boolean;
  loot: number;
  date: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface Warning {
  id: string;
  memberId: string;
  memberName: string;
  reason: string;
  severity: 'Leve' | 'Média' | 'Grave';
  date: string;
}

export interface SystemLog {
  id: string;
  message: string;
  date: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS' | 'AI';
}
