"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import {
  MARKET_API,
  type Category,
  type Product,
  bnNumber,
  getChangeLabel,
  priceLabel,
  unitLabel,
} from "@/lib/market";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickerProducts, setTickerProducts] = useState<Product[]>([]);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${MARKET_API}/categories`).then((response) => {
        if (!response.ok) throw new Error("ক্যাটাগরি লোড করা যায়নি");
        return response.json() as Promise<Category[]>;
      }),
      fetch(`${MARKET_API}/products`).then((response) => {
        if (!response.ok) throw new Error("দাম লোড করা যায়নি");
        return response.json() as Promise<Product[]>;
      }),
    ])
      .then(([categoryData, products]) => {
        if (!active) return;
        setCategories(categoryData);
        setTickerProducts(products);
      })
      .catch((error: unknown) => {
        if (active)
          toast.error(
            error instanceof Error
              ? error.message
              : "বাজারের তথ্য লোড করা যায়নি",
          );
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        toast.error(result.error.message ?? "সাইন আউট করা যায়নি");
        return;
      }
      toast.success("সফলভাবে সাইন আউট হয়েছে");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সাইন আউট করা যায়নি");
    } finally {
      setSigningOut(false);
    }
  }

  const dateParts = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(new Date());
  const getDatePart = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value ?? "";
  const banglaDate = `${getDatePart("weekday")}, ${getDatePart("day")} ${getDatePart("month")} ${getDatePart("year")}`;

  return (
    <header className="site-header">
      <div className="container header-main">
        <Link className="brand" href="/" aria-label="বাজার দর হোম পেজ">
          <span className="brand-icon">
            <Image
              src="/logo-icon.png"
              width={34}
              height={34}
              alt=""
              priority
            />
          </span>
          <span className="brand-copy">
            <span className="brand-title">বাজার দর</span>
            <span className="brand-date">{banglaDate}</span>
          </span>
        </Link>
        <div className="auth-nav">
          {isPending ? (
            <span className="brand-date">লোড হচ্ছে…</span>
          ) : session ? (
            <details className="account-menu">
              <summary
                className="account-menu-trigger"
                aria-label={`${session.user.name || "আমার প্রোফাইল"} মেনু`}
              >
                <span className="account-avatar" aria-hidden="true">
                  {session.user.name?.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="account-name">
                  {session.user.name || "আমার প্রোফাইল"}
                </span>
                <span className="account-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="account-menu-panel">
                <Link className="account-menu-item" href="/profile">
                  আমার প্রোফাইল
                </Link>
                <button
                  className="account-menu-item"
                  type="button"
                  disabled={signingOut}
                  onClick={handleSignOut}
                >
                  {signingOut && <span className="auth-spinner" aria-hidden="true" />}
                  {signingOut ? "সাইন আউট হচ্ছে…" : "সাইন আউট"}
                </button>
              </div>
            </details>
          ) : (
            <>
              <Link className="button button-text" href="/signin">
                সাইন ইন
              </Link>
              <Link className="button button-primary" href="/signup">
                সাইন আপ
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="container category-nav" aria-label="পণ্যের ক্যাটাগরি">
        <Link
          className={`category-link ${pathname === "/" ? "active" : ""}`}
          href="/"
        >
          সব পণ্য
        </Link>
        {categories.map((category) => (
          <Link
            className={`category-link ${pathname === `/category/${category.slug}` ? "active" : ""}`}
            href={`/category/${category.slug}`}
            key={category.slug}
          >
            {category.icon} {category.nameBn}
          </Link>
        ))}
      </nav>
      {tickerProducts.length > 0 && (
        <div className="price-strip" aria-label="আজকের বাজারদরের চলমান তালিকা">
          <div className="ticker-track">
            {[...tickerProducts, ...tickerProducts].map((product, index) => (
              <span className="ticker-item" key={`${product.id}-${index}`}>
                {product.image} {product.nameBn}
                <strong>
                  {priceLabel(product.today)} / {unitLabel(product.unit)}
                </strong>
                <span className={product.change.dir}>
                  {getChangeLabel(product.change)}
                </span>
                <span className="sr-only">{bnNumber(product.today)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
