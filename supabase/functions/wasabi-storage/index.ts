import { S3Client, PutObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3.637.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function getClient(): { client: S3Client; bucket: string } {
  const accessKey = (Deno.env.get("WASABI_ACCESS_KEY") || Deno.env.get("VITE_WASABI_ACCESS_KEY"))?.trim();
  const secretKey = (Deno.env.get("WASABI_SECRET_KEY") || Deno.env.get("VITE_WASABI_SECRET_KEY"))?.trim();
  const bucketName = (Deno.env.get("WASABI_BUCKET_NAME") || Deno.env.get("VITE_WASABI_BUCKET_NAME"))?.trim();
  const endpoint = (Deno.env.get("WASABI_ENDPOINT") || Deno.env.get("VITE_WASABI_ENDPOINT"))?.trim();

  if (!accessKey || !secretKey || !bucketName || !endpoint) {
    throw new Error("Faltan secretos de Wasabi");
  }

  const endpointUrl = new URL(endpoint);
  const region = Deno.env.get("WASABI_REGION")?.trim()
    || endpointUrl.hostname.match(/s3\.([a-z0-9-]+)\.wasabisys\.com/i)?.[1]
    || "eu-central-1";

  const client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true,
  });

  return { client, bucket: bucketName };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { client, bucket } = getClient();

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "upload";

    if (action === "health") {
      const endpoint = (Deno.env.get("WASABI_ENDPOINT") || Deno.env.get("VITE_WASABI_ENDPOINT"))?.trim();
      const region = (Deno.env.get("WASABI_REGION") || Deno.env.get("VITE_WASABI_REGION"))?.trim()
        || (endpoint ? new URL(endpoint).hostname.match(/s3\.([a-z0-9-]+)\.wasabisys\.com/i)?.[1] : "")
        || "eu-central-1";
      return new Response(
        JSON.stringify({ configured: true, bucket, endpoint, region }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── UPLOAD + TEST ────────────────────────────────────
    if (req.method === "POST" && (action === "upload" || action === "test")) {
      let key: string;
      let bodyBytes: Uint8Array;
      let contentType: string;

      if (action === "test") {
        key = `2026/test/test-${Date.now()}.txt`;
        bodyBytes = new TextEncoder().encode("apedeca-test-connection");
        contentType = "text/plain";
      } else {
        const fileName = url.searchParams.get("filename") || `file-${Date.now()}`;
        const folder = url.searchParams.get("folder") || "general";
        const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
        key = `2026/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const buf = await req.arrayBuffer();
        bodyBytes = new Uint8Array(buf);
        contentType = req.headers.get("Content-Type") || "application/octet-stream";
      }

      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bodyBytes,
        ContentType: contentType,
      }));

      if (action === "test") {
        await client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })).catch(() => {});

        return new Response(
          JSON.stringify({ ok: true, message: `Conexión correcta. Bucket: ${bucket}` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const endpoint = (Deno.env.get("WASABI_ENDPOINT") || Deno.env.get("VITE_WASABI_ENDPOINT"))?.trim();
      const publicUrl = `${endpoint?.replace(/\/$/, "")}/${bucket}/${key}`;
      return new Response(
        JSON.stringify({ path: key, url: publicUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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

      await client.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }));

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
    const message = err instanceof Error ? err.message : "Internal error";
    const name = err instanceof Error ? err.name : "Unknown";
    return new Response(
      JSON.stringify({ error: message, name }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
