const ABACATEPAY_BASE = "https://api.abacatepay.com/v1";

interface ChargeResult {
  id: string;
  url: string;
}

export async function createCreditPackCharge(
  userId: string,
  email: string
): Promise<ChargeResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const headers = {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    "Content-Type": "application/json",
  };

  const payload = {
    amount: Number(process.env.CREDITS_PACK_15_PRICE) || 2500, // centavos
    description: "Pacote 15 Créditos — Currículo que Passa",
    customer: { email },
    metadata: {
      user_id: userId,
      credits: Number(process.env.CREDITS_PACK_15_AMOUNT) || 15,
      plan: "pacote_15",
    },
    redirectUrl: `${appUrl}/sucesso`,
    webhookUrl: `${appUrl}/api/payment/webhook`,
  };

  const res = await fetch(`${ABACATEPAY_BASE}/billing/create`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AbacatePay error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id || data.data?.id || "",
    url: data.url || data.data?.url || data.checkoutUrl || "",
  };
}

export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET || "";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expected = Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}
