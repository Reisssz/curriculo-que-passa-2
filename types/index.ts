export interface AnalysisResult {
  match_score: number;
  score_label: "Fraco" | "Regular" | "Bom" | "Excelente";
  missing_keywords: string[];
  present_keywords: string[];
  top_recommendation: string;
  summary_strengths: string[];
  summary_gaps: string[];
  improved_resume: string;
  ats_tips: string[];
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
