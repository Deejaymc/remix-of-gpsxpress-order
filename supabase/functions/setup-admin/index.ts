import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email, password, setup_token } = await req.json();

    // Require a setup token from environment to prevent unauthorized admin creation
    const expectedToken = Deno.env.get("ADMIN_SETUP_TOKEN");
    if (!expectedToken) {
      return new Response(
        JSON.stringify({ error: "Setup desabilitado. Configure ADMIN_SETUP_TOKEN para habilitar." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    if (!setup_token || setup_token !== expectedToken) {
      return new Response(
        JSON.stringify({ error: "Token de setup inválido." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Validate inputs
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email e senha são obrigatórios." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Senha deve ter no mínimo 8 caracteres." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if any admin exists already
    const { data: existingAdmins } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("role", "admin");

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ error: "Admin já existe. Use o sistema para criar novos usuários." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;

    // Assign admin role
    await supabaseAdmin.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "admin",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Admin criado com sucesso!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Erro ao processar requisição." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
