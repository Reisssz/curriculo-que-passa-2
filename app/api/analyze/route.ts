import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResume } from "@/lib/groq/ats-engine";
import { z } from "zod";

const schema = z.object({
  job_description: z.string().min(50).max(10000),
  resume: z.string().min(50).max(15000),
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado. Faça login para continuar." }, { status: 401 });
    }

    // Validate body
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
    }

    const { job_description, resume } = parsed.data;

    // Check credits in DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
    }

    if (profile.credits <= 0) {
      return NextResponse.json(
        { error: "Créditos insuficientes. Compre mais créditos para continuar.", code: "NO_CREDITS" },
        { status: 402 }
      );
    }

    // Deduct 1 credit atomically
    const { error: deductError } = await supabase.rpc("deduct_credit", { user_id: user.id });
    if (deductError) {
      return NextResponse.json({ error: "Erro ao processar crédito." }, { status: 500 });
    }

    // Run AI analysis
    const result = await analyzeResume(job_description, resume);

    // Save analysis to DB
    const jobTitle = job_description.split("\n")[0].slice(0, 100);
    await supabase.from("analyses").insert({
      user_id: user.id,
      match_score: result.match_score,
      score_label: result.score_label,
      job_title: jobTitle,
      missing_keywords: result.missing_keywords,
      present_keywords: result.present_keywords,
      top_recommendation: result.top_recommendation,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("[analyze] error:", err);
    return NextResponse.json(
      { error: "Erro ao processar análise. Tente novamente." },
      { status: 500 }
    );
  }
}
