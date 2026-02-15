import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Upsert user record
        await supabase.from("users").upsert(
          {
            id: user.id,
            email: user.email,
            nome:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "Jogador",
            foto_url: user.user_metadata?.avatar_url || null,
          },
          { onConflict: "id" }
        );

        // Check if onboarding is complete
        const { data: userData } = await supabase
          .from("users")
          .select("onboarding_completo")
          .eq("id", user.id)
          .single();

        // If there's a saved sala code in the next param, preserve it
        if (!userData?.onboarding_completo) {
          const redirectUrl = new URL("/onboarding", origin);
          if (next !== "/") {
            redirectUrl.searchParams.set("next", next);
          }
          return NextResponse.redirect(redirectUrl);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Auth code exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
