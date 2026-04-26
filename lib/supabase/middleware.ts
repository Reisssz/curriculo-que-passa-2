import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type Cookie = {
  name: string;
  value: string;
  options?: Record<string, any>;
};

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se as variáveis não estiverem disponíveis, deixa passar sem autenticar
  if (!supabaseUrl || !supabaseKey) {
    console.warn("[middleware] Supabase env vars missing — skipping auth check");
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet: Cookie[]) {
        // Atualiza cookies no request
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        // Recria response para garantir sync
        supabaseResponse = NextResponse.next({ request });

        // Atualiza cookies no response
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // 🔥 Melhor prática: evita erro silencioso
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("[middleware] Supabase getUser error:", error.message);
  }

  const protectedPaths = ["/dashboard", "/resultado", "/planos", "/sucesso"];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 🔒 Redirecionamento seguro
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}