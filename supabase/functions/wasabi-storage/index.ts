const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ── AWS Signature V4 helpers (node:crypto) ────────────

async function hmac(key: Uint8Array | string, message: string): Promise<Uint8Array> {
  const rawKey = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(signature);
}

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
} 

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function awsSignV4(opts: {
  method: string;
  host: string;
  path: string;
  region: string;
  service: string;
  accessKey: string;
  secretKey: string;
  headers: Record<string, string>;
  bodyHex: string;
}): Promise<Record<string, string>> {
  const { method, host, path, region, service, accessKey, secretKey, headers, bodyHex } = opts;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const allHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    allHeaders[k.toLowerCase()] = v;
  }
  allHeaders["host"] = host;
  allHeaders["x-amz-content-sha256"] = bodyHex;
  allHeaders["x-amz-date"] = amzDate;

  const canonicalHeaders = Object.keys(allHeaders)
    .sort()
    .map((k) => `${k}:${allHeaders[k].trim()}\n`)
    .join("");
  const signedHeaders = Object.keys(allHeaders).sort().join(";");

  const canonicalRequest = [
    method,
    path,
    "", // no query string
    canonicalHeaders,
    signedHeaders,
    bodyHex,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = await hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const signature = bytesToHex(await hmac(kSigning, stringToSign));

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { ...allHeaders, Authorization: authHeader };
}

// ── Main handler ─────────────────────────────────────

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

    const endpointUrl = new URL(endpoint);
    const host = endpointUrl.host;
    const endpointRegion = endpointUrl.hostname.match(/s3\.([a-z0-9-]+)\.wasabisys\.com/i)?.[1];
    const region = Deno.env.get("WASABI_REGION") || endpointRegion || "eu-central-1";

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "upload";

    if (action === "health") {
      return new Response(
        JSON.stringify({ configured: true, bucket: bucketName, endpoint, region }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── UPLOAD + TEST ────────────────────────────────────
    if (req.method === "POST" && (action === "upload" || action === "test")) {
      const contentType = action === "test"
        ? "text/plain"
        : (req.headers.get("Content-Type") || "application/octet-stream");
      let key: string;
      let bodyBytes: Uint8Array;

      if (action === "test") {
        key = `2026/test/test-${Date.now()}.txt`;
        bodyBytes = new TextEncoder().encode("apedeca-test-connection");
      } else {
        const fileName = url.searchParams.get("filename") || `file-${Date.now()}`;
        const folder = url.searchParams.get("folder") || "general";
        const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
        key = `2026/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const buf = await req.arrayBuffer();
        bodyBytes = new Uint8Array(buf);
      }

      const path = `/${bucketName}/${key.split("/").map(encodeURIComponent).join("/")}`;
      const bodyHex = await sha256Hex(bodyBytes);

      const signedHeaders = await awsSignV4({
        method: "PUT",
        host,
        path,
        region,
        service: "s3",
        accessKey,
        secretKey,
        headers: { "content-type": contentType },
        bodyHex,
      });

      const res = await fetch(`https://${host}${path}`, {
        method: "PUT",
        headers: signedHeaders,
        body: bodyBytes,
      });

      if (!res.ok) {
        const errText = await res.text();
        return new Response(
          JSON.stringify({
            error: `Wasabi respondió ${res.status}: ${errText || res.statusText}`,
            region,
            bucket: bucketName,
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (action === "test") {
        // Delete the test file
        const delPath = `/${bucketName}/${key.split("/").map(encodeURIComponent).join("/")}`;
        const delHeaders = await awsSignV4({
          method: "DELETE",
          host,
          path: delPath,
          region,
          service: "s3",
          accessKey,
          secretKey,
          headers: {},
          bodyHex: await sha256Hex(""),
        });
        await fetch(`https://${host}${delPath}`, {
          method: "DELETE",
          headers: delHeaders,
        }).catch(() => {});

        return new Response(
          JSON.stringify({ ok: true, message: `Conexión correcta. Bucket: ${bucketName}, Región: ${region}` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const publicUrl = `${endpoint.replace(/\/$/, "")}/${bucketName}/${key}`;
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

      const path = `/${bucketName}/${key.split("/").map(encodeURIComponent).join("/")}`;
      const signedHeaders = await awsSignV4({
        method: "DELETE",
        host,
        path,
        region,
        service: "s3",
        accessKey,
        secretKey,
        headers: {},
        bodyHex: await sha256Hex(""),
      });

      const res = await fetch(`https://${host}${path}`, {
        method: "DELETE",
        headers: signedHeaders,
      });

      if (!res.ok) {
        const errText = await res.text();
        return new Response(
          JSON.stringify({ error: `Wasabi respondió ${res.status}: ${errText || res.statusText}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── DOWNLOAD (presigned URL) ─────────────────────────
    if (req.method === "GET" && action === "download") {
      const key = url.searchParams.get("key");
      if (!key) {
        return new Response(
          JSON.stringify({ error: "Missing key parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const path = `/${bucketName}/${key.split("/").map(encodeURIComponent).join("/")}`;
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
      const dateStamp = amzDate.slice(0, 8);
      const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
      const expires = 3600;

      const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
      const signedHeaders = "host;x-amz-date";

      const queryParams = new URLSearchParams({
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": `${accessKey}/${credentialScope}`,
        "X-Amz-Date": amzDate,
        "X-Amz-Expires": String(expires),
        "X-Amz-SignedHeaders": signedHeaders,
      });

      const canonicalQuery = queryParams
        .toString()
        .split("&")
        .map((p) => decodeURIComponent(p))
        .sort()
        .join("&");

      const canonicalRequest = [
        "GET",
        path,
        canonicalQuery,
        canonicalHeaders,
        signedHeaders,
        "UNSIGNED-PAYLOAD",
      ].join("\n");

      const stringToSign = [
        "AWS4-HMAC-SHA256",
        amzDate,
        credentialScope,
        await sha256Hex(canonicalRequest),
      ].join("\n");

      const kDate = await hmac(`AWS4${secretKey}`, dateStamp);
      const kRegion = await hmac(kDate, region);
      const kService = await hmac(kRegion, "s3");
      const kSigning = await hmac(kService, "aws4_request");
      const signature = bytesToHex(await hmac(kSigning, stringToSign));

      queryParams.set("X-Amz-Signature", signature);
      const signedUrl = `https://${host}${path}?${queryParams.toString()}`;

      return Response.redirect(signedUrl, 302);
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
