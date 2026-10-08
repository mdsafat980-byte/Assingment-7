"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ProductGrid } from "@/components/product-grid";
import { ProductLoading } from "@/components/product-loading";
import {
  MARKET_API,
  type Product,
  getChangeLabel,
  priceLabel,
} from "@/lib/market";

export function MarketHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");

  async function loadProducts() {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`${MARKET_API}/products`);
      if (!response.ok) throw new Error("বাজারের পণ্য লোড করা যায়নি");
      setProducts((await response.json()) as Product[]);
    } catch (error) {
      setLoadError(true);
      toast.error(
        error instanceof Error ? error.message : "বাজারের পণ্য লোড করা যায়নি",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const risers = useMemo(
    () =>
      [...products]
        .filter((product) => product.change.dir === "up")
        .sort((a, b) => b.change.pct - a.change.pct)
        .slice(0, 6),
    [products],
  );
  const fallers = useMemo(
    () =>
      [...products]
        .filter((product) => product.change.dir === "down")
        .sort((a, b) => a.change.pct - b.change.pct)
        .slice(0, 6),
    [products],
  );
  const filteredProducts = useMemo(
    () => products.filter((product) => product.nameBn.includes(query.trim())),
    [products, query],
  );

  return (
    <>
      <main className="container">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> প্রতিদিনের বাজার, এবার হাতের
              মুঠোয়
            </div>
            <h1>
              বাজারের সঠিক দাম,
              <br />
              <span>সিদ্ধান্ত হোক সহজ।</span>
            </h1>
            <p>
              নিত্যপ্রয়োজনীয় পণ্যের আজকের বাজারদর জানুন, দামের ওঠানামা দেখুন
              এবং পরিকল্পনা করুন নিশ্চিন্তে।
            </p>
            <a className="button button-primary" href="#সব-পণ্য">
              আজকের বাজারদর দেখুন <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="hero-art">
            <Image
              src="/bazar-hero.png"
              width={340}
              height={260}
              alt="তাজা বাজারের সবজির ঝুড়ি"
              priority
            />
          </div>
        </section>

        <section className="section" aria-labelledby="risers-heading">
          <div className="section-heading">
            <div>
              <div className="section-kicker">গতকালের তুলনায়</div>
              <h2 className="section-title" id="risers-heading">
                আজ দাম বেড়েছে <span style={{ color: "#cc554d" }}>▲</span>
              </h2>
            </div>
            <span className="text-link">শীর্ষ ৬ পণ্য</span>
          </div>
          {loading ? (
            <ProductLoading count={6} />
          ) : loadError ? (
            <div className="error-box">
              দাম লোড করা যায়নি।{" "}
              <button
                className="button button-light"
                onClick={() => void loadProducts()}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : (
            <div className="riser-faller-grid">
              {risers.length ? (
                <div className="mini-list">
                  {risers.map((product) => (
                    <Link
                      className="mini-item"
                      href={`/product/${product.slug}`}
                      key={product.id}
                    >
                      <span className="mini-emoji">{product.image}</span>
                      <span className="mini-name">
                        {product.nameBn}
                        <span className="mini-price">
                          {priceLabel(product.today)}
                        </span>
                      </span>
                      <span className="mini-change change-up">
                        {getChangeLabel(product.change)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-box">এখনো কোনো পণ্যের দাম বাড়েনি।</div>
              )}
              <div className="mini-list" aria-label="দাম কমেছে">
                <div className="mini-item" style={{ background: "#fbfcfa" }}>
                  <span className="mini-name">
                    আজ দাম কমেছে <span style={{ color: "#16804e" }}>▼</span>
                  </span>
                </div>
                {fallers.map((product) => (
                  <Link
                    className="mini-item"
                    href={`/product/${product.slug}`}
                    key={product.id}
                  >
                    <span className="mini-emoji">{product.image}</span>
                    <span className="mini-name">
                      {product.nameBn}
                      <span className="mini-price">
                        {priceLabel(product.today)}
                      </span>
                    </span>
                    <span className="mini-change change-down">
                      {getChangeLabel(product.change)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <section
          className="section all-products"
          id="সব-পণ্য"
          aria-labelledby="all-products-heading"
        >
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                সাশ্রয়ের বাজার শুরু হোক এখান থেকে
              </div>
              <h2 className="section-title" id="all-products-heading">
                সব পণ্য
              </h2>
              <p className="section-subtitle">
                আজকের বাজারদর ও দামের পরিবর্তন এক নজরে দেখুন।
              </p>
            </div>
          </div>
          <div className="product-toolbar">
            <label className="search-field">
              <Search size={17} />
              <input
                aria-label="পণ্য খুঁজুন"
                placeholder="পণ্য খুঁজুন…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {!loading && !loadError && (
              <span className="section-kicker">
                মোট {products.length}টি পণ্য
              </span>
            )}
          </div>
          {loading ? (
            <ProductLoading />
          ) : loadError ? (
            <div className="error-box">
              পণ্যের তালিকা পাওয়া যায়নি।{" "}
              <button
                className="button button-light"
                onClick={() => void loadProducts()}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </section>
      </main>
    </>
  );
}
