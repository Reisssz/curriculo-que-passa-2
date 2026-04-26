import crypto from "crypto";

// A v2 usa base URL diferente para produtos
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

/**
 * Garante que o produto existe na AbacatePay.
 * Se ABACATEPAY_PRODUCT_ID estiver no env, usa direto.
 * Caso contrário, cria o produto via API e loga o ID para
 * você adicionar ao .env (evita recriar a cada chamada).
 */
async function ensureProductId(): Promise<string> {
  // Se já tiver o ID configurado, usa direto
  if (process.env.ABACATEPAY_PRODUCT_ID) {
    return process.env.ABACATEPAY_PRODUCT_ID;
  }

  const price   = Number(process.env.CREDITS_PACK_15_PRICE)  || 2500;
  const credits = Number(process.env.CREDITS_PACK_15_AMOUNT) || 15;

  // Criar o produto via API
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

  // Logar para o dev adicionar ao .env e não recriar sempre
  console.warn(
    `[AbacatePay] Produto criado: ${productId}\n` +
    `👉 Adicione ao .env: ABACATEPAY_PRODUCT_ID=${productId}`
  );

  return productId;
}

/**
 * Cria um checkout no AbacatePay v2.
 * Usa o produto pré-cadastrado (ou cria automaticamente na primeira vez).
 */
export async function createCreditPackCharge(
  userId: string,
  email: string
): Promise<ChargeResult> {
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const credits   = Number(process.env.CREDITS_PACK_15_AMOUNT) || 15;
  const productId = process.env.ABACATEPAY_PRODUCT_ID!;

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

  // Tentar v1 e v2
  for (const base of ["https://api.abacatepay.com/v1", "https://api.abacatepay.com/v2"]) {
    const url = `${base}/checkouts/create`;
    console.log("[AbacatePay] Tentando:", url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
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

/**
 * Verifica assinatura HMAC-SHA256 do webhook.
 * AbacatePay usa a API_KEY como secret e encoda em base64.
 */
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