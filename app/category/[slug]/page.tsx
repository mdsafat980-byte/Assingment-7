"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ProductGrid } from "@/components/product-grid";
import { ProductLoading } from "@/components/product-loading";
import { fetchMarketData, type Category, type Product } from "@/lib/market";

type SortOrder = "default" | "asc" | "desc";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<SortOrder>("default");

  useEffect(() => {
    let active = true;
    async function loadCategory() {
      setLoading(true);
      setError(false);
      try {
        const [categories, items] = await Promise.all([
          fetchMarketData<Category[]>("/categories", "ক্যাটাগরির তথ্য লোড করা যায়নি"),
          fetchMarketData<Product[]>(
            `/products?category=${encodeURIComponent(slug)}`,
            "ক্যাটাগরির তথ্য লোড করা যায়নি",
          ),
        ]);
        const selectedCategory = categories.find((item) => item.slug === slug);
        if (active) {
          setCategory(selectedCategory ?? null);
          setProducts(selectedCategory ? items : []);
        }
      } catch (cause) {
        if (active) {
          setError(true);
          toast.error(cause instanceof Error ? cause.message : "ক্যাটাগরি লোড করা যায়নি");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadCategory();
    return () => { active = false; };
  }, [slug]);

  const sortedProducts = useMemo(() => {
    if (sort === "default") return products;
    return [...products].sort((first, second) =>
      sort === "asc" ? first.today - second.today : second.today - first.today,
    );
  }, [products, sort]);

  return (
    <>
      <main>
        <div className="page-heading">
          <div className="container">
            <div className="breadcrumbs"><Link href="/">হোম</Link> / ক্যাটাগরি</div>
            <h1>{category ? `${category.icon} ${category.nameBn}` : "ক্যাটাগরি খুঁজে পাওয়া যায়নি"}</h1>
            <p>{category ? `${products.length}টি পণ্যের আজকের বাজারদর` : "এই নামে কোনো পণ্যের ক্যাটাগরি নেই।"}</p>
          </div>
        </div>
        <div className="container category-content">
          {loading ? <ProductLoading /> : error ? <div className="error-box">ক্যাটাগরি লোড করা যায়নি। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।</div> : !category || products.length === 0 ? (
            <div className="not-found"><div><h1>৪০৪</h1><h2>এই ক্যাটাগরিতে কোনো পণ্য নেই</h2><p>সঠিক ক্যাটাগরি খুঁজে পাওয়া যায়নি।</p><Link className="button button-primary" href="/">হোম পেজে ফিরে যান</Link></div></div>
          ) : (
            <>
              <div className="product-toolbar">
                <span className="section-kicker">মোট {products.length}টি পণ্য</span>
                <label className="sort-control">সাজান:
                  <span className="sort-select-wrap">
                    <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)} aria-label="পণ্যের দাম অনুযায়ী সাজান">
                      <option value="default">ডিফল্ট</option>
                      <option value="asc">দাম: কম থেকে বেশি</option>
                      <option value="desc">দাম: বেশি থেকে কম</option>
                    </select>
                    <ChevronDown className="sort-chevron" size={16} aria-hidden="true" />
                  </span>
                </label>
              </div>
              <ProductGrid products={sortedProducts} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
