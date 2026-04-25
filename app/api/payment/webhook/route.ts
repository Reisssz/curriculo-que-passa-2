import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/abacatepay/service";
import { sendPaymentConfirmationEmail } from "@/lib/resend/emails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-abacatepay-signature") || "";

    // Verify HMAC signature
    const valid = await verifyWebhookSignature(body, signature);
    if (!valid) {
      console.warn("[webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);

    if (data?.status !== "PAID") {
      return NextResponse.json({ received: true });
    }

    const { user_id, credits } = data?.metadata || {};
    if (!user_id || !credits) {
      console.error("[webhook] Missing metadata:", data?.metadata);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Add credits to user profile
    const { error: creditError } = await supabase.rpc("add_credits", {
      user_id,
      amount: Number(credits),
    });

    if (creditError) {
      console.error("[webhook] add_credits error:", creditError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // Update payment record
    await supabase
      .from("payments")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("charge_id", data.id);

    // Send confirmation email
    const { data: userData } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user_id)
      .single();

    if (userData?.email) {
      await sendPaymentConfirmationEmail(
        userData.email,
        Number(credits),
        data.amount || 2500
      ).catch(console.error);
    }

    console.log(`[webhook] Credits added: user=${user_id} credits=${credits}`);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[webhook] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
