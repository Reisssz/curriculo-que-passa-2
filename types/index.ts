export interface ResumeContact {
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  site?: string;
}

export interface ResumeExperience {
  title: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  period: string;
}

export interface ResumeStructured {
  contact: ResumeContact;
  summary: string;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  competencies: string[];
  languages: string[];
  certifications: string[];
}

export interface AnalysisResult {
  match_score: number;
  optimized_score: number;
  score_label: "Fraco" | "Regular" | "Bom" | "Excelente";
  optimized_score_label: "Fraco" | "Regular" | "Bom" | "Excelente";
  missing_keywords: string[];
  present_keywords: string[];
  inserted_keywords: string[];
  top_recommendation: string;
  summary_strengths: string[];
  summary_gaps: string[];
  ats_tips: string[];
  improved_resume: string;           // texto plano para exibir na tela
  resume_structured: ResumeStructured; // estrutura para o PDF
}

export interface UserProfile {
  id: string;
  email: string;
  credits: number;
  plan: string;
  created_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  match_score: number;
  score_label: string;
  job_title: string;
  created_at: string;
}

export type Plan = "avulso" | "pacote_15";