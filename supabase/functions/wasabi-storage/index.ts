import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
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
        JSON.stringify({
          error: "Faltan secretos de Wasabi",
          missing: {
            accessKey: !accessKey,
            secretKey: !secretKey,
            bucketName: !bucketName,
            endpoint: !endpoint,
          },
        }),
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

    // ── TEST (HEAD bucket + small upload + delete) ──────
    if (req.method === "POST" && action === "test") {
      const testKey = `2026/test/test-${Date.now()}.txt`;

      // 1. Check bucket exists / reachable
      try {
        await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
      } catch (headErr) {
        const msg = headErr instanceof Error ? headErr.message : String(headErr);
        return new Response(
          JSON.stringify({ error: `No se puede acceder al bucket "${bucketName}" en ${endpoint}: ${msg}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // 2. Upload a tiny file
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: testKey,
            Body: new TextEncoder().encode("apedeca-test"),
            ContentType: "text/plain",
          }),
        );
      } catch (putErr) {
        const msg = putErr instanceof Error ? putErr.message : String(putErr);
        return new Response(
          JSON.stringify({ error: `Bucket accesible pero no se pudo subir: ${msg}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // 3. Clean up
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: testKey }));
      } catch (_delErr) {
        // ignore cleanup failure
      }

      return new Response(
        JSON.stringify({ ok: true, message: "Bucket accesible y subida correcta." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
    const message = err instanceof Error ? err.message : "Internal error";
    const name = err instanceof Error ? err.name : "Unknown";
    return new Response(
      JSON.stringify({ error: message, name }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
