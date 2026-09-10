import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "npm:@aws-sdk/client-s3@3.645.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.645.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function getWasabiConfig() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  const client = createClient(supabaseUrl, serviceKey);
  const { data, error } = await client
    .from("storage_config")
    .select("key, value");

  if (error || !data) return null;

  const config: Record<string, string> = {};
  for (const row of data) {
    config[row.key] = row.value;
  }

  return {
    accessKey: config["WASABI_ACCESS_KEY"],
    secretKey: config["WASABI_SECRET_KEY"],
    bucketName: config["WASABI_BUCKET_NAME"],
    endpoint: config["WASABI_ENDPOINT"],
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const config = await getWasabiConfig();

    if (!config || !config.accessKey || !config.secretKey || !config.bucketName || !config.endpoint) {
      return new Response(
        JSON.stringify({ error: "Wasabi credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const s3 = new S3Client({
      region: "eu-central-1",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: true,
    });

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "upload";

    // ── UPLOAD ──────────────────────────────────────────
    if (req.method === "POST" && action === "upload") {
      const contentType = req.headers.get("Content-Type") || "application/octet-stream";
      const fileName = url.searchParams.get("filename") || `file-${Date.now()}`;
      const folder = url.searchParams.get("folder") || "2026";
      const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
      const key = `2026/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const body = await req.arrayBuffer();

      await s3.send(
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: key,
          Body: new Uint8Array(body),
          ContentType: contentType,
        }),
      );

      const publicUrl = `${config.endpoint}/${config.bucketName}/${key}`;

      return new Response(
        JSON.stringify({ path: key, url: publicUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── DOWNLOAD (redirect to presigned URL) ────────────
    if (req.method === "GET" && action === "download") {
      const key = url.searchParams.get("key");
      if (!key) {
        return new Response(
          JSON.stringify({ error: "Missing key parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: config.bucketName, Key: key }),
        { expiresIn: 3600 },
      );

      return Response.redirect(signedUrl, 302);
    }

    // ── DELETE ──────────────────────────────────────────
    if (req.method === "POST" && action === "delete") {
      const { key } = await req.json();
      if (!key) {
        return new Response(
          JSON.stringify({ error: "Missing key" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      await s3.send(
        new DeleteObjectCommand({ Bucket: config.bucketName, Key: key }),
      );

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
