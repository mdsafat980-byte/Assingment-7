import { NextRequest, NextResponse } from "next/server";

const apiBases = [
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const endpoint = path.map(encodeURIComponent).join("/");
  const query = request.nextUrl.search;
  let lastError: unknown;

  for (const base of apiBases) {
    try {
      const response = await fetch(`${base}/${endpoint}${query}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (response.status >= 500) {
        lastError = new Error(`Market API returned ${response.status}`);
        continue;
      }
      const body = await response.text();
      return new NextResponse(body, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") ?? "application/json",
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Both BazarDor market API endpoints failed.", lastError);
  return NextResponse.json(
    { message: "বাজারের তথ্য এখন পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
    { status: 502 },
  );
}
