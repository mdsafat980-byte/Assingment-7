import { NextRequest, NextResponse } from "next/server";

/**
 * Mirrors of the BazarDor API, ordered by reliability.
 *
 * `api.abcz.workers.dev` answers consistently. `api.api-store.workers.dev`
 * is currently answered with a Cloudflare 429 for every request, so it is
 * kept only as a backup — asking it first just added a wasted round trip to
 * every page load.
 */
const apiBases = [
  "https://api.abcz.workers.dev/api/bazardor",
  "https://api.api-store.workers.dev/api/bazardor",
];

/** Answers are cached by Next for a minute, matching the client-side cache. */
const CACHE_SECONDS = 60;

/** How many times a single mirror may be retried on a rate-limit reply. */
const RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** True when the mirror should be skipped and the next one tried. */
function isRetryableStatus(status: number) {
  return status === 429 || status >= 500;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const endpoint = path.map(encodeURIComponent).join("/");
  const query = request.nextUrl.search;

  if (path.length === 0) {
    return NextResponse.json({ message: "অনুরোধের পথ সঠিক নয়।" }, { status: 400 });
  }

  let lastError: unknown;

  for (const base of apiBases) {
    for (let attempt = 0; attempt <= RETRIES; attempt++) {
      try {
        const response = await fetch(`${base}/${endpoint}${query}`, {
          next: { revalidate: CACHE_SECONDS },
          headers: { Accept: "application/json" },
        });

        if (isRetryableStatus(response.status)) {
          lastError = new Error(`${base} returned ${response.status}`);
          // Rate limited: wait a beat, then give this mirror one more chance.
          if (attempt < RETRIES) {
            await sleep(250 * (attempt + 1));
            continue;
          }
          break; // move on to the next mirror
        }

        const body = await response.text();

        return new NextResponse(body, {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get("Content-Type") ?? "application/json; charset=utf-8",
            "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
          },
        });
      } catch (error) {
        lastError = error;
        if (attempt < RETRIES) await sleep(250 * (attempt + 1));
      }
    }
  }

  console.error("All BazarDor market API mirrors failed.", lastError);
  return NextResponse.json(
    { message: "বাজারের তথ্য এখন পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  );
}