import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCreditPackCharge } from "@/lib/abacatepay/service";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const charge = await createCreditPackCharge(user.id, user.email!);

    // Save pending payment
    await supabase.from("payments").insert({
      user_id: user.id,
      charge_id: charge.id,
      amount: Number(process.env.CREDITS_PACK_15_PRICE) || 2500,
      credits: Number(process.env.CREDITS_PACK_15_AMOUNT) || 15,
      status: "pending",
    });

    return NextResponse.json({ checkout_url: charge.url, charge_id: charge.id });
  } catch (err: any) {
    console.error("[payment/create] error:", err);
    return NextResponse.json({ error: "Erro ao criar cobrança. Tente novamente." }, { status: 502 });
  }
}
