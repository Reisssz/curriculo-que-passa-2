import Groq from "groq-sdk";
import { AnalysisResult } from "@/types";

const MAX_JOB_CHARS = 3000;
const MAX_RESUME_CHARS = 4000;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...[truncado]";
}

const SYSTEM_PROMPT = `Você é um especialista sênior em Recursos Humanos com 15 anos de experiência em recrutamento e ATS para o mercado brasileiro.

Sua missão é:
1. Analisar o currículo vs a vaga
2. Extrair os dados reais do candidato do currículo original
3. Reescrever o conteúdo otimizado para ATS mantendo apenas fatos reais

REGRAS ABSOLUTAS:
- Responda APENAS com JSON válido, sem markdown
- NUNCA invente experiências, empresas, cursos ou dados pessoais
- Extraia nome, email, telefone, linkedin e localização EXATAMENTE como estão no currículo original
- Se uma informação não existir no currículo, deixe como string vazia ""
- Keywords da vaga devem ser inseridas naturalmente nas descrições de experiências reais

TÉCNICAS ATS OBRIGATÓRIAS:
- Resumo profissional deve espelhar o perfil pedido na vaga usando keywords dela
- Bullets de experiência: verbo de ação + resultado quantificado + keyword da vaga
- Skills listadas EXATAMENTE como aparecem na vaga (ex: "React.js" não "ReactJS")
- Reorganizar experiências para destacar as mais relevantes para a vaga`;

function buildUserPrompt(jobDesc: string, resume: string): string {
  return `<vaga>
${jobDesc}
</vaga>

<curriculo_original>
${resume}
</curriculo_original>

Retorne EXATAMENTE este JSON (sem campos extras, sem markdown):
{
  "match_score": <inteiro 0-100, score do currículo ORIGINAL vs vaga>,
  "optimized_score": <inteiro 0-100, score estimado após otimização, deve ser >= 85>,
  "score_label": <"Fraco" se <40 | "Regular" se 40-59 | "Bom" se 60-79 | "Excelente" se >=80>,
  "optimized_score_label": <"Fraco" se <40 | "Regular" se 40-59 | "Bom" se 60-79 | "Excelente" se >=80>,
  "missing_keywords": [<keywords da vaga ausentes no currículo original, max 12>],
  "present_keywords": [<keywords da vaga já presentes no currículo, max 10>],
  "inserted_keywords": [<keywords inseridas no currículo otimizado, max 12>],
  "top_recommendation": <string mais importante, max 150 chars>,
  "summary_strengths": [<3 pontos fortes do candidato para esta vaga>],
  "summary_gaps": [<3 lacunas do candidato para esta vaga>],
  "ats_tips": [<3 dicas de RH para melhorar ainda mais>],
  "resume_structured": {
    "contact": {
      "name": <nome completo extraído do currículo original, string>,
      "email": <email extraído do currículo original, string ou "">,
      "phone": <telefone extraído do currículo original, string ou "">,
      "linkedin": <linkedin extraído do currículo original, string ou "">,
      "location": <cidade/estado extraído do currículo original, string ou "">,
      "site": <site/portfolio extraído do currículo original, string ou "">
    },
    "summary": <parágrafo de resumo profissional otimizado com keywords da vaga, 3-4 linhas>,
    "experiences": [
      {
        "title": <cargo exato do currículo original>,
        "company": <empresa exata do currículo original>,
        "period": <período exato do currículo original>,
        "bullets": [<3-5 bullets otimizados com verbos de ação e keywords da vaga, baseados nas atividades reais>]
      }
    ],
    "education": [
      {
        "degree": <curso/grau exato do currículo original>,
        "institution": <instituição exata do currículo original>,
        "period": <período exato do currículo original>
      }
    ],
    "skills": [<lista de habilidades técnicas, priorizando as que aparecem na vaga>],
    "competencies": [<lista de competências comportamentais relevantes para a vaga>],
    "languages": [<idiomas do currículo original, ex: "Inglês - Avançado">],
    "certifications": [<certificações do currículo original>]
  }
}

Observação: o campo resume_structured deve conter apenas dados REAIS do currículo original, reescritos e otimizados. Nunca invente dados.`;
}

function normalizeStructured(data: any): any {
  // Garante estrutura mínima
  if (!data.resume_structured) {
    data.resume_structured = {
      contact: { name: "", email: "", phone: "", linkedin: "", location: "", site: "" },
      summary: "",
      experiences: [],
      education: [],
      skills: [],
      competencies: [],
      languages: [],
      certifications: [],
    };
  }

  const s = data.resume_structured;
  if (!s.contact)       s.contact       = { name: "", email: "", phone: "", linkedin: "", location: "", site: "" };
  if (!s.experiences)   s.experiences   = [];
  if (!s.education)     s.education     = [];
  if (!s.skills)        s.skills        = [];
  if (!s.competencies)  s.competencies  = [];
  if (!s.languages)     s.languages     = [];
  if (!s.certifications) s.certifications = [];

  // Garante que bullets existem em cada experiência
  s.experiences = s.experiences.map((e: any) => ({
    title:   e.title   || "",
    company: e.company || "",
    period:  e.period  || "",
    bullets: Array.isArray(e.bullets) ? e.bullets : [],
  }));

  return data;
}

function buildPlainText(data: any): string {
  const s = data.resume_structured;
  if (!s) return "";

  const lines: string[] = [];
  const c = s.contact;

  if (c.name)     lines.push(c.name);
  const contactLine = [c.email, c.phone, c.location, c.linkedin, c.site]
    .filter(Boolean).join(" | ");
  if (contactLine) lines.push(contactLine);
  lines.push("");

  if (s.summary) {
    lines.push("RESUMO PROFISSIONAL");
    lines.push(s.summary);
    lines.push("");
  }

  if (s.experiences?.length) {
    lines.push("EXPERIÊNCIA PROFISSIONAL");
    s.experiences.forEach((e: any) => {
      lines.push(`${e.title} | ${e.company} | ${e.period}`);
      e.bullets?.forEach((b: string) => lines.push(`• ${b}`));
      lines.push("");
    });
  }

  if (s.education?.length) {
    lines.push("FORMAÇÃO ACADÊMICA");
    s.education.forEach((e: any) => {
      lines.push(`${e.degree} | ${e.institution} | ${e.period}`);
    });
    lines.push("");
  }

  if (s.skills?.length) {
    lines.push("HABILIDADES TÉCNICAS");
    lines.push(s.skills.join(" • "));
    lines.push("");
  }

  if (s.competencies?.length) {
    lines.push("COMPETÊNCIAS");
    s.competencies.forEach((c: string) => lines.push(`• ${c}`));
    lines.push("");
  }

  if (s.languages?.length) {
    lines.push("IDIOMAS");
    s.languages.forEach((l: string) => lines.push(`• ${l}`));
    lines.push("");
  }

  if (s.certifications?.length) {
    lines.push("CERTIFICAÇÕES");
    s.certifications.forEach((c: string) => lines.push(`• ${c}`));
    lines.push("");
  }

  return lines.join("\n").trim();
}

export async function analyzeResume(
  jobDescription: string,
  resume: string
): Promise<AnalysisResult> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const jobT    = truncate(jobDescription, MAX_JOB_CHARS);
  const resumeT = truncate(resume, MAX_RESUME_CHARS);

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.15,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: buildUserPrompt(jobT, resumeT) },
    ],
    response_format: { type: "json_object" },
  });

  const raw  = completion.choices[0].message.content || "{}";
  let data   = JSON.parse(raw);

  // Normalize score labels
  for (const [scoreField, labelField] of [
    ["match_score", "score_label"],
    ["optimized_score", "optimized_score_label"],
  ] as const) {
    const score = data[scoreField] ?? 0;
    if (!["Fraco","Regular","Bom","Excelente"].includes(data[labelField])) {
      data[labelField] =
        score >= 80 ? "Excelente" :
        score >= 60 ? "Bom" :
        score >= 40 ? "Regular" : "Fraco";
    }
  }

  data.missing_keywords  = (data.missing_keywords  || []).slice(0, 12);
  data.present_keywords  = (data.present_keywords  || []).slice(0, 10);
  data.inserted_keywords = (data.inserted_keywords || []).slice(0, 12);
  data.summary_strengths = data.summary_strengths || [];
  data.summary_gaps      = data.summary_gaps      || [];
  data.ats_tips          = data.ats_tips          || [];

  data = normalizeStructured(data);

  // Gera o texto plano a partir da estrutura (para exibir na tela)
  data.improved_resume = buildPlainText(data);

  return data as AnalysisResult;
}