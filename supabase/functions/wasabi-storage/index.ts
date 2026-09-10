import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "npm:@aws-sdk/client-s3@3.645.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.645.0";

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
    const accessKey = Deno.env.get("WASABI_ACCESS_KEY");
    const secretKey = Deno.env.get("WASABI_SECRET_KEY");
    const bucketName = Deno.env.get("WASABI_BUCKET_NAME");
    const endpoint = Deno.env.get("WASABI_ENDPOINT");

    if (!accessKey || !secretKey || !bucketName || !endpoint) {
      return new Response(
        JSON.stringify({ error: "Wasabi credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "upload";

    if (action === "health") {
      return new Response(
        JSON.stringify({ configured: true, bucket: bucketName, endpoint }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const s3 = new S3Client({
      region: "eu-central-1",
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });

    // ── UPLOAD ───────────────────────────────────────────
    if (req.method === "POST" && action === "upload") {
      const contentType = req.headers.get("Content-Type") || "application/octet-stream";
      const fileName = url.searchParams.get("filename") || `file-${Date.now()}`;
      const folder = url.searchParams.get("folder") || "general";
      const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
      const key = `2026/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const body = await req.arrayBuffer();

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: new Uint8Array(body),
          ContentType: contentType,
        }),
        { abortSignal: AbortSignal.timeout(10000) },
      );

      const publicUrl = `${endpoint.replace(/\/$/, "")}/${bucketName}/${key}`;

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
        new GetObjectCommand({ Bucket: bucketName, Key: key }),
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
        new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
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
    const message = err instanceof DOMException && err.name === "TimeoutError"
      ? "Wasabi no respondió dentro del tiempo límite. Comprueba el endpoint y el bucket."
      : err instanceof Error ? err.message : "Internal error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
