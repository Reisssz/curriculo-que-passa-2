import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@curriculo-que-passa.com.br";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const confirmUrl = `${APP_URL}/auth/confirm?token_hash=${token}&type=email`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "✅ Confirme seu e-mail — Currículo que Passa",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F2;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#5CBF15;padding:32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Currículo que Passa</h1>
          <p style="margin:8px 0 0;color:#DBF2C4;font-size:14px;">Seu currículo pronto para passar no ATS</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 32px;">
          <h2 style="margin:0 0 16px;color:#111;font-size:20px;font-weight:700;">Confirme seu e-mail 🎉</h2>
          <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
            Estamos quase lá! Clique no botão abaixo para confirmar seu e-mail e ativar sua conta.
            Você recebe <strong style="color:#5CBF15;">1 crédito gratuito</strong> logo após a confirmação.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${confirmUrl}"
               style="display:inline-block;background:#5CBF15;color:#fff;font-size:16px;font-weight:700;
                      padding:16px 40px;border-radius:100px;text-decoration:none;letter-spacing:0.3px;">
              ✅ Confirmar meu e-mail
            </a>
          </div>
          <p style="margin:24px 0 0;color:#999;font-size:13px;text-align:center;">
            Se você não criou uma conta, ignore este e-mail.<br>
            Este link expira em 24 horas.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#F2F2F2;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#999;font-size:12px;">© 2024 Currículo que Passa · Todos os direitos reservados</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "🚀 Bem-vindo ao Currículo que Passa! Seu crédito está disponível",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#F2F2F2;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F2;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#5CBF15;padding:32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Currículo que Passa</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <h2 style="margin:0 0 16px;color:#111;font-size:20px;font-weight:700;">Bem-vindo${name ? `, ${name}` : ""}! 🎉</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            Sua conta foi criada com sucesso. Você já tem <strong style="color:#5CBF15;">1 crédito gratuito</strong> disponível para fazer sua primeira análise de currículo com IA.
          </p>
          <div style="background:#DBF2C4;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
            <p style="margin:0;color:#2d6a04;font-size:32px;font-weight:800;">1 crédito</p>
            <p style="margin:4px 0 0;color:#2d6a04;font-size:14px;">disponível agora</p>
          </div>
          <div style="text-align:center;margin:32px 0;">
            <a href="${APP_URL}/dashboard"
               style="display:inline-block;background:#5CBF15;color:#fff;font-size:16px;font-weight:700;
                      padding:16px 40px;border-radius:100px;text-decoration:none;">
              Fazer minha primeira análise →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#F2F2F2;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#999;font-size:12px;">© 2024 Currículo que Passa</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendPaymentConfirmationEmail(
  email: string,
  credits: number,
  amount: number
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `✅ Pagamento confirmado — ${credits} créditos adicionados`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#F2F2F2;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F2;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#5CBF15;padding:32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Currículo que Passa</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <h2 style="margin:0 0 16px;color:#111;font-size:20px;font-weight:700;">Pagamento confirmado! ✅</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            Seu pagamento de <strong>R$ ${(amount / 100).toFixed(2).replace(".", ",")}</strong> foi confirmado.
            <strong style="color:#5CBF15;">${credits} créditos</strong> foram adicionados à sua conta.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${APP_URL}/dashboard"
               style="display:inline-block;background:#5CBF15;color:#fff;font-size:16px;font-weight:700;
                      padding:16px 40px;border-radius:100px;text-decoration:none;">
              Usar meus créditos →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#F2F2F2;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#999;font-size:12px;">© 2024 Currículo que Passa</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
