"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ProductLoading } from "@/components/product-loading";
import { MARKET_API, type Product, priceLabel, unitLabel } from "@/lib/market";

export function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${MARKET_API}/products`)
      .then(async (response) => {
        if (!response.ok) throw new Error("পণ্যের তথ্য লোড করা যায়নি");
        const items = (await response.json()) as Product[];
        const item = items.find((entry) => entry.slug === slug);
        if (!item) throw new Error("পণ্য খুঁজে পাওয়া যায়নি");
        if (active) setProduct(item);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(true);
          toast.error(
            cause instanceof Error
              ? cause.message
              : "পণ্যের তথ্য পাওয়া যায়নি",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading)
    return (
      <main className="container" style={{ paddingTop: 45 }}>
        <ProductLoading count={1} />
      </main>
    );
  if (error || !product)
    return (
      <main className="not-found">
        <div>
          <h1>৪০৪</h1>
          <h2>পণ্য খুঁজে পাওয়া যায়নি</h2>
          <p>এই পণ্যটি সরানো হয়েছে অথবা ঠিকানাটি ভুল।</p>
          <Link className="button button-primary" href="/">
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </main>
    );

  const marketPrices = product.markets ?? [];
  const minimum = marketPrices.length
    ? Math.min(...marketPrices.map((market) => market.min))
    : product.today;
  const maximum = marketPrices.length
    ? Math.max(...marketPrices.map((market) => market.max))
    : product.today;
  const average = marketPrices.length
    ? marketPrices.reduce(
        (sum, market) => sum + (market.min + market.max) / 2,
        0,
      ) / marketPrices.length
    : product.today;

  return (
    <main className="container">
      <div className="detail-layout">
        <div className="detail-main">
          <div className="breadcrumbs">
            <Link href="/">হোম</Link> /{" "}
            <Link href={`/category/${product.category}`}>
              {product.categoryNameBn}
            </Link>{" "}
            / {product.nameBn}
          </div>
          <div className="detail-intro">
            <div className="detail-emoji">{product.image}</div>
            <div>
              <h1>{product.nameBn}</h1>
              <p>
                {product.nameBn} — বাংলাদেশের বিভিন্ন বাজারে আজকের সম্ভাব্য দর ও
                দামের পরিবর্তন।
              </p>
              <div className="tag-list">
                <Link className="tag" href={`/category/${product.category}`}>
                  {product.categoryIcon} {product.categoryNameBn}
                </Link>
                <span className="tag">{unitLabel(product.unit)}</span>
              </div>
            </div>
          </div>
          <section className="market-table-wrap">
            <h2>বাজারভিত্তিক আজকের দাম</h2>
            {marketPrices.length ? (
              <table className="market-table">
                <thead>
                  <tr>
                    <th>বাজার</th>
                    <th>বিভাগ</th>
                    <th>সর্বনিম্ন</th>
                    <th>সর্বোচ্চ</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPrices.map((market) => (
                    <tr key={`${market.market}-${market.division}`}>
                      <td>{market.market}</td>
                      <td>{market.division}</td>
                      <td>{priceLabel(market.min)}</td>
                      <td>{priceLabel(market.max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-box">
                এই পণ্যের বাজারভিত্তিক তথ্য এখন পাওয়া যাচ্ছে না।
              </div>
            )}
          </section>
        </div>
        <aside className="summary-panel">
          <h2>দামের সারাংশ</h2>
          <div className="summary-price">
            <span>সর্বনিম্ন দাম</span>
            <strong>{priceLabel(minimum)}</strong>
          </div>
          <div className="summary-price">
            <span>সর্বোচ্চ দাম</span>
            <strong>{priceLabel(maximum)}</strong>
          </div>
          <div className="summary-price">
            <span>গড় দাম</span>
            <strong>{priceLabel(Math.round(average))}</strong>
          </div>
          <div className="summary-price">
            <span>একক</span>
            <strong>{unitLabel(product.unit)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
