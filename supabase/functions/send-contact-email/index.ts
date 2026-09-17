import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { name, email, message, fileName, filePath } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: settings, error: settingsError } = await supabase
      .from("ape_cms_settings")
      .select("email")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError) throw settingsError;

    const toEmail = settings?.email ?? "info@apedeca.es";

    const { error: insertError } = await supabase
      .from("ape_contact_submissions")
      .insert({
        name,
        email,
        message,
        file_path: filePath ?? null,
        file_name: fileName ?? null,
      });

    if (insertError) throw insertError;

    const fileLine = fileName
      ? `\n\nArchivo adjunto: ${fileName}`
      : "";

    const emailBody = `Nueva consulta desde el formulario de contacto:

Nombre: ${name}
Correo: ${email}

Mensaje:
${message}${fileLine}`;

    const { error: rpcError } = await supabase.rpc("send_email", {
      to_email: toEmail,
      subject: `Nueva consulta de contacto - ${name}`,
      body: emailBody,
    });

    let emailSent = false;
    if (rpcError) {
      console.error("send_email RPC not available:", rpcError.message);
    } else {
      emailSent = true;
    }

    return new Response(
      JSON.stringify({ success: true, emailSent, to: toEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("send-contact-email error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
