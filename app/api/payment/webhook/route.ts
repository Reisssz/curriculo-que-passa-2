import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/abacatepay/service";
import { sendPaymentConfirmationEmail } from "@/lib/resend/emails";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-abacatepay-signature") || "";

    // Verificar assinatura (pular em dev se secret não configurado)
    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (apiKey && signature) {
      const valid = verifyWebhookSignature(body, signature);
      if (!valid) {
        console.warn("[webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    const event   = payload?.event;

    console.log("[webhook] Event:", event, "| devMode:", payload?.devMode);

    // Evento de checkout pago na AbacatePay v2
    if (event !== "checkout.completed") {
      return NextResponse.json({ received: true, skipped: event });
    }

    const checkout = payload?.data?.checkout;
    if (!checkout) {
      console.error("[webhook] Missing checkout in payload");
      return NextResponse.json({ error: "Missing checkout" }, { status: 400 });
    }

    // Extrair user_id e credits do metadata (enviados no create)
    const metadata = checkout.metadata || {};
    const userId   = metadata.user_id;
    const credits  = Number(metadata.credits) || 15;

    if (!userId) {
      console.error("[webhook] Missing user_id in metadata:", metadata);
      return NextResponse.json({ error: "Missing user_id in metadata" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Adicionar créditos atomicamente
    const { error: creditError } = await supabase.rpc("add_credits", {
      user_id: userId,
      amount:  credits,
    });

    if (creditError) {
      console.error("[webhook] add_credits error:", creditError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // Atualizar registro de pagamento
    await supabase
      .from("payments")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("charge_id", checkout.id || "");

    // Enviar e-mail de confirmação via Resend
    const customerEmail = payload?.data?.customer?.email || metadata.email;
    if (customerEmail) {
      await sendPaymentConfirmationEmail(
        customerEmail,
        credits,
        checkout.paidAmount || checkout.amount || 2500
      ).catch(err => console.error("[webhook] email error:", err));
    }

    console.log(`[webhook] ✅ user=${userId} +${credits} créditos`);
    return NextResponse.json({ received: true, credits_added: credits });

  } catch (err: any) {
    console.error("[webhook] Unhandled error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
