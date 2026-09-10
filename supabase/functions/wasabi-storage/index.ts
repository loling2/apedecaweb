const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Wasabi S3 storage proxy — credentials v2

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmac(key: Uint8Array | string, message: string): Promise<Uint8Array> {
  const rawKey = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message)));
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getConfig(): { accessKey: string; secretKey: string; bucket: string; endpoint: string; host: string; region: string } {
  const accessKey = "463244LR5DNM7LTWYBP8";
  const secretKey = "z00eiHTuOzYFFzeZk33QgO5d312eDBP49XZWFCzn";
  const bucket = "apedecadocumentos";
  const endpoint = "https://s3.eu-central-2.wasabisys.com";
  const endpointUrl = new URL(endpoint);
  return { accessKey, secretKey, bucket, endpoint, host: endpointUrl.host, region: "eu-central-2" };
}

async function signedRequest(
  method: string,
  key: string,
  body: Uint8Array,
  contentType?: string,
): Promise<Response> {
  const { accessKey, secretKey, bucket, endpoint, host, region } = getConfig();
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(body);
  const path = `/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (contentType) headers["content-type"] = contentType;

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers).sort().map((name) => `${name}:${headers[name].trim()}\n`).join("");
  const canonicalRequest = [method, path, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");
  const kDate = await hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, "s3");
  const kSigning = await hmac(kService, "aws4_request");
  const signature = hex(await hmac(kSigning, stringToSign));

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return fetch(`${endpoint}${path}`, {
    method,
    headers: { ...headers, Authorization: authorization },
    body: method === "PUT" ? body : undefined,
    signal: AbortSignal.timeout(25000),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const config = getConfig();
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "upload";

    if (action === "health") {
      return new Response(JSON.stringify({ configured: true, bucket: config.bucket, endpoint: config.endpoint, region: config.region }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && (action === "test" || action === "upload")) {
      const isTest = action === "test";
      const key = isTest
        ? `2026/test/test-${Date.now()}.txt`
        : `2026/${url.searchParams.get("folder") || "general"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${(url.searchParams.get("filename") || "file.bin").split(".").pop()}`;
      const body = isTest ? new TextEncoder().encode("apedeca-test-connection") : new Uint8Array(await req.arrayBuffer());
      const contentType = isTest ? "text/plain" : (req.headers.get("Content-Type") || "application/octet-stream");
      const response = await signedRequest("PUT", key, body, contentType);

      if (!response.ok) {
        const detail = await response.text();
        return new Response(JSON.stringify({ error: `Wasabi respondió ${response.status}: ${detail || response.statusText}` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (isTest) {
        await signedRequest("DELETE", key, new Uint8Array()).catch(() => undefined);
        return new Response(JSON.stringify({ ok: true, message: `Conexión correcta. Bucket: ${config.bucket}, Región: ${config.region}` }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ path: key, url: `${config.endpoint}/${config.bucket}/${key}` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "delete") {
      const { key } = await req.json() as { key?: string };
      if (!key) return new Response(JSON.stringify({ error: "Missing key" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const response = await signedRequest("DELETE", key, new Uint8Array());
      if (!response.ok) return new Response(JSON.stringify({ error: `Wasabi respondió ${response.status}: ${await response.text()}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
