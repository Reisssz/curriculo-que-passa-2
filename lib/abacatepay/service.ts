import crypto from "crypto";

const BASE_V1 = "https://api.abacatepay.com/v1";
const BASE_V2 = "https://api.abacatepay.com/v2";

interface ChargeResult {
  id: string;
  url: string;
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function ensureProductId(): Promise<string> {
  if (process.env.ABACATEPAY_PRODUCT_ID) {
    return process.env.ABACATEPAY_PRODUCT_ID;
  }

  // Preço padrão agora R$ 25,00 (2500 centavos)
  const price   = Number(process.env.CREDITS_PACK_15_PRICE)  || 2500;
  const credits = Number(process.env.CREDITS_PACK_15_AMOUNT) || 15;

  const res = await fetch(`${BASE_V2}/products/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      externalId: "cqp-credits-pack-15",
      name:       `Pacote ${credits} Créditos — Currículo que Passa`,
      price,
      currency:   "BRL",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AbacatePay create product error: ${res.status} ${err}`);
  }

  const json = await res.json();
  const productId = (json.data ?? json).id;

  console.warn(
    `[AbacatePay] Produto criado: ${productId}\n` +
    `👉 Adicione ao .env: ABACATEPAY_PRODUCT_ID=${productId}`
  );

  return productId;
}

export async function createCreditPackCharge(
  userId: string,
  email: string
): Promise<ChargeResult> {
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL || "https://curriculo-que-passa-2.vercel.app/";
  const credits   = Number(process.env.CREDITS_PACK_15_AMOUNT) || 15;
  const productId = await ensureProductId(); // <- usa ensureProductId para nunca ficar undefined

  const payload = {
    items: [{ id: productId, quantity: 1 }],
    externalId: `cqp-${userId}-${Date.now()}`,
    returnUrl:     `${appUrl}/planos`,
    completionUrl: `${appUrl}/sucesso`,
    methods:       ["PIX", "CARD"],
    metadata: {
      user_id: userId,
      credits: String(credits),
      email,
    },
  };

  console.log("[AbacatePay] Payload:", JSON.stringify(payload, null, 2));

  for (const base of [BASE_V1, BASE_V2]) {
    const url = `${base}/checkouts/create`;
    console.log("[AbacatePay] Tentando:", url);

    const res = await fetch(url, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    console.log("[AbacatePay] Resposta", base, res.status, JSON.stringify(json));

    if (res.ok) {
      const data = json.data ?? json;
      return { id: data.id || "", url: data.url || "" };
    }
  }

  throw new Error("AbacatePay: ambos endpoints falharam — veja os logs acima");
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureFromHeader: string
): boolean {
  try {
    const secret   = process.env.ABACATEPAY_API_KEY || "";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(Buffer.from(rawBody, "utf8"))
      .digest("base64");

    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signatureFromHeader, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}