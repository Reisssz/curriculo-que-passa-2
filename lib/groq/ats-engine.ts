import Groq from "groq-sdk";
import { AnalysisResult } from "@/types";

const MAX_JOB_CHARS = 3000;
const MAX_RESUME_CHARS = 4000;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...[truncado]";
}

const SYSTEM_PROMPT = `Você é um especialista sênior em Recursos Humanos com 15 anos de experiência em recrutamento, ATS (Applicant Tracking Systems) e otimização de currículos para o mercado brasileiro.

Seu trabalho é analisar currículos com profundidade técnica e reescrever a versão otimizada usando as melhores práticas de RH para maximizar as chances do candidato passar pelo filtro ATS e impressionar o recrutador humano.

TÉCNICAS OBRIGATÓRIAS NA REESCRITA DO CURRÍCULO OTIMIZADO:
1. PALAVRAS-CHAVE: Incorporar naturalmente as keywords da vaga em contextos relevantes
2. MÉTRICAS: Quantificar conquistas sempre que possível (%, valores, prazos, volume)
3. VERBOS DE AÇÃO: Iniciar cada bullet com verbo forte no passado (Liderou, Implementou, Reduziu, Aumentou, Desenvolveu, Coordenou, Otimizou)
4. FORMATO ATS-FRIENDLY: Seções claras com títulos reconhecíveis (EXPERIÊNCIA PROFISSIONAL, FORMAÇÃO ACADÊMICA, HABILIDADES TÉCNICAS, COMPETÊNCIAS)
5. RELEVÂNCIA: Reorganizar experiências para destacar o mais relevante para a vaga
6. RESUMO PROFISSIONAL: Criar/melhorar um parágrafo de abertura poderoso com as keywords principais
7. HABILIDADES: Listar habilidades técnicas exatamente como aparecem na vaga
8. SEM INFORMAÇÕES FALSAS: Apenas reescrever e reorganizar o que já existe no currículo original

REGRAS ABSOLUTAS:
- Responda APENAS com JSON válido, sem markdown, sem texto extra
- Nunca invente experiências, empresas, cursos ou habilidades inexistentes
- O currículo otimizado deve conter APENAS informações do currículo original, reescritas e otimizadas
- Palavras-chave devem vir literalmente da descrição da vaga`;

function buildUserPrompt(jobDesc: string, resume: string): string {
  return `<vaga>
${jobDesc}
</vaga>

<curriculo_original>
${resume}
</curriculo_original>

Analise e retorne EXATAMENTE este JSON (sem campos extras, sem markdown):
{
  "match_score": <inteiro 0-100 representando % de compatibilidade ATS>,
  "score_label": <"Fraco" se <40 | "Regular" se 40-59 | "Bom" se 60-79 | "Excelente" se >=80>,
  "missing_keywords": [<até 12 keywords importantes da vaga que NÃO estão no currículo>],
  "present_keywords": [<até 10 keywords da vaga que JÁ estão no currículo>],
  "top_recommendation": <string única mais importante, max 150 chars>,
  "summary_strengths": [<3 pontos fortes do candidato para esta vaga>],
  "summary_gaps": [<3 lacunas principais do candidato para esta vaga>],
  "ats_tips": [<3 dicas específicas de RH para melhorar ainda mais o currículo>],
  "improved_resume": <string com o currículo COMPLETO otimizado usando as técnicas de RH descritas, bem formatado com seções claras, bullets com verbos de ação e métricas onde possível>
}`;
}

export async function analyzeResume(
  jobDescription: string,
  resume: string
): Promise<AnalysisResult> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const jobT = truncate(jobDescription, MAX_JOB_CHARS);
  const resumeT = truncate(resume, MAX_RESUME_CHARS);

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: buildUserPrompt(jobT, resumeT) },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content || "{}";
  const data = JSON.parse(raw);

  // Normalize score_label
  const score = data.match_score ?? 0;
  if (!["Fraco", "Regular", "Bom", "Excelente"].includes(data.score_label)) {
    data.score_label =
      score >= 80 ? "Excelente" :
      score >= 60 ? "Bom" :
      score >= 40 ? "Regular" : "Fraco";
  }

  // Ensure arrays exist
  data.missing_keywords = (data.missing_keywords || []).slice(0, 12);
  data.present_keywords = (data.present_keywords || []).slice(0, 10);
  data.summary_strengths = data.summary_strengths || [];
  data.summary_gaps = data.summary_gaps || [];
  data.ats_tips = data.ats_tips || [];

  return data as AnalysisResult;
}
