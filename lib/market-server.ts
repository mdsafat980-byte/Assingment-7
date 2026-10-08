/**
 * Server-side market data access.
 *
 * The client fetches through `/api/market` (see app/api/market/[...path]).
 * Server components read the upstream API directly so the first HTML frame
 * already contains the category navigation and the ticker.
 */

/** Mirrors ordered by reliability — `api-store` currently answers 429. */
export const API_BASES = [
  "https://api.abcz.workers.dev/api/bazardor",
  "https://api.api-store.workers.dev/api/bazardor",
] as const;

/** Prices change slowly; a minute of caching keeps the upstream happy. */
const REVALIDATE = 60;

/**
 * Used only if every mirror is unreachable, so the navigation is never empty.
 * Keep in sync with the upstream `/categories` response.
 */
export const FALLBACK_CATEGORIES = [
  { id: "chal", slug: "chal", nameBn: "চাল", icon: "🍚" },
  { id: "dal", slug: "dal", nameBn: "ডাল", icon: "🫘" },
  { id: "tel", slug: "tel", nameBn: "তেল", icon: "🛢️" },
  { id: "sobji", slug: "sobji", nameBn: "সবজি", icon: "🥬" },
  { id: "mach", slug: "mach", nameBn: "মাছ", icon: "🐟" },
  { id: "mangsho", slug: "mangsho", nameBn: "মাংস", icon: "🍗" },
  { id: "dim-dui", slug: "dim-dui", nameBn: "ডিম-দুধ", icon: "🥛" },
  { id: "mosla", slug: "mosla", nameBn: "মসলা", icon: "🌶️" },
] as const;

/** Fetch JSON from the first healthy mirror. Never throws. */
async function fetchFromUpstream<T>(path: string): Promise<T | null> {
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}${path}`, {
        next: { revalidate: REVALIDATE },
        headers: { Accept: "application/json" },
      });

      // Rate limited or down — try the next mirror.
      if (response.status === 429 || response.status >= 500) continue;

      return (await response.json()) as T;
    } catch {
      continue;
    }
  }

  return null;
}

export async function getCategories() {
  const data = await fetchFromUpstream<Category[]>("/categories");
  return Array.isArray(data) && data.length > 0 ? data : [...FALLBACK_CATEGORIES];
}

export async function getProducts(): Promise<Product[]> {
  const data = await fetchFromUpstream<Product[]>("/products");
  return Array.isArray(data) ? data : [];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const filtered = await fetchFromUpstream<Product[]>(
    `/products?category=${encodeURIComponent(category)}`,
  );
  if (Array.isArray(filtered) && filtered.length > 0) return filtered;

  // Some mirrors ignore the query filter — fall back to filtering locally.
  const all = await getProducts();
  return all.filter((product) => product.category === category);
}

/** A single product by slug (or numeric id). */
export async function getProduct(slug: string): Promise<Product | null> {
  const direct = await fetchFromUpstream<Product>(`/products/${encodeURIComponent(slug)}`);
  if (direct?.slug) return direct;

  const all = await getProducts();
  return all.find((p) => p.slug === slug || String(p.id) === slug) ?? null;
}

/** Just enough products to fill the scrolling price strip. */
export async function getTickerProducts(limit = 20): Promise<Product[]> {
  const all = await getProducts();
  return all.slice(0, limit);
}

// Re-exported so server components only need one import.
export type { Category, PriceChange, Product } from "./market";
import type { Category, Product } from "./market";