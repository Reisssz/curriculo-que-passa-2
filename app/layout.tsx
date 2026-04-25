import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Currículo que Passa — Otimize seu currículo com IA",
  description:
    "Analise seu currículo vs a vaga com IA, receba um Score ATS e gere uma versão otimizada para passar no filtro automático.",
  keywords: "currículo, ATS, análise de currículo, otimização de currículo, emprego, vagas, IA",
  openGraph: {
    title: "Currículo que Passa",
    description: "Otimize seu currículo com IA e passe pelo filtro ATS",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
            },
            success: {
              style: { background: "#DBF2C4", color: "#2d6a04", border: "1px solid #AAF277" },
              iconTheme: { primary: "#5CBF15", secondary: "#fff" },
            },
            error: {
              style: { background: "#FEE2E2", color: "#991b1b", border: "1px solid #FCA5A5" },
            },
          }}
        />
      </body>
    </html>
  );
}
