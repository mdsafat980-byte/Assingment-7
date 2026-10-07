"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SiteFooter } from "@/components/site-footer";
import { authClient } from "@/lib/auth-client";

function safeCallbackURL(value: string | null) {
  if (!value) return "/";
  try {
    const target = new URL(value, "http://localhost");
    if (target.origin !== "http://localhost") return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const callbackURL = safeCallbackURL(searchParams.get("callbackURL"));

  useEffect(() => {
    if (searchParams.get("reason") === "protected") toast("পণ্যের বিস্তারিত দেখতে আগে সাইন ইন করুন।");
  }, [searchParams]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await authClient.signIn.email({ email, password, callbackURL });
      if (result.error) {
        toast.error(result.error.message ?? "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়");
        return;
      }
      toast.success("স্বাগতম! সফলভাবে সাইন ইন হয়েছে।");
      router.push(callbackURL);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সাইন ইন করা যায়নি");
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "github") {
    try {
      const result = await authClient.signIn.social({ provider, callbackURL });
      if (result.error) toast.error(result.error.message ?? `${provider} দিয়ে সাইন ইন করা যায়নি`);
    } catch {
      toast.error(`${provider} লগইনের জন্য OAuth credentials সেট করা নেই বা লগইন ব্যর্থ হয়েছে।`);
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-brand"><Image src="/logo-icon.png" width={43} height={43} alt="" /></div>
      <h1>আবার স্বাগতম</h1><p className="auth-description">আপনার বাজারদর অ্যাকাউন্টে সাইন ইন করুন।</p>
      <form onSubmit={submit}>
        <label className="form-field">ইমেইল<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="আপনার ইমেইল" /></label>
        <label className="form-field">পাসওয়ার্ড<input type="password" autoComplete="current-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="কমপক্ষে ৮ অক্ষর" /></label>
        <button className="button button-primary auth-submit" disabled={busy}>{busy ? "সাইন ইন হচ্ছে…" : "সাইন ইন"}</button>
      </form>
      <div className="auth-divider">অথবা চালিয়ে যান</div>
      <div className="social-row"><button className="social-button" type="button" onClick={() => void social("google")}>Google</button><button className="social-button" type="button" onClick={() => void social("github")}>GitHub</button></div>
      <p className="auth-switch">অ্যাকাউন্ট নেই? <Link href="/signup">নতুন অ্যাকাউন্ট তৈরি করুন</Link></p>
    </section>
  );
}

export default function SignInPage() {
  return <><main className="auth-shell"><Suspense fallback={<div className="auth-card">লোড হচ্ছে…</div>}><SignInForm /></Suspense></main><SiteFooter /></>;
}
