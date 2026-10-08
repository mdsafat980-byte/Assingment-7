"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthSkeleton } from "@/components/auth-skeleton";
import { SiteFooter } from "@/components/site-footer";
import { type SocialProvider, useSocialProviders } from "@/components/use-social-providers";
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

function withAuthResult(callbackURL: string) {
  const target = new URL(callbackURL, "http://localhost");
  target.searchParams.set("auth", "signin");
  return `${target.pathname}${target.search}${target.hash}`;
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | "github" | null>(null);
  const socialProviders = useSocialProviders();
  const callbackURL = safeCallbackURL(searchParams.get("callbackURL"));

  useEffect(() => {
    if (searchParams.get("reason") === "protected") toast("পণ্যের বিস্তারিত দেখতে আগে সাইন ইন করুন।");
  }, [searchParams]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("email");
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
      setBusy(null);
    }
  }

  async function social(provider: SocialProvider) {
    if (!socialProviders) {
      toast("সামাজিক লগইনের অবস্থা যাচাই হচ্ছে। একটু পরে চেষ্টা করুন।");
      return;
    }
    if (!socialProviders[provider]) {
      toast.error(
        `${provider === "google" ? "Google" : "GitHub"} লগইন চালু করতে OAuth Client ID ও Client Secret সেট করুন।`,
      );
      return;
    }
    setBusy(provider);
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: withAuthResult(callbackURL),
      });
      if (result.error) toast.error(result.error.message ?? `${provider} দিয়ে সাইন ইন করা যায়নি`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${provider} দিয়ে সাইন ইন করা যায়নি`);
    } finally {
      setBusy(null);
    }
  }

  function handleInvalid(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.error("সঠিক ইমেইল ও কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন।", { id: "signin-validation" });
  }

  return (
    <section className="auth-card">
      <div className="auth-brand"><span className="auth-brand-icon"><Image src="/logo-icon.png" width={34} height={34} alt="" /></span></div>
      <h1>সাইন ইন করুন</h1><p className="auth-description">আপনার বাজারদর অ্যাকাউন্টে আবার স্বাগতম।</p>
      <form onSubmit={submit} onInvalid={handleInvalid}>
        <label className="form-field">ইমেইল<input name="email" type="email" autoComplete="email" required disabled={busy !== null} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="আপনার ইমেইল" /></label>
        <label className="form-field">পাসওয়ার্ড<input name="password" type="password" autoComplete="current-password" minLength={8} maxLength={128} required disabled={busy !== null} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="কমপক্ষে ৮ অক্ষর" /></label>
        <button className="button button-primary auth-submit" disabled={busy !== null}>{busy === "email" && <span className="auth-spinner" aria-hidden="true" />}{busy === "email" ? "সাইন ইন হচ্ছে…" : "সাইন ইন"}</button>
      </form>
      <div className="auth-divider">অথবা চালিয়ে যান</div>
      {socialProviders ? (
        <div className="social-row"><button className="social-button" type="button" disabled={busy !== null} onClick={() => void social("google")}>{busy === "google" ? "Google দিয়ে যাচাই হচ্ছে…" : "Google"}</button><button className="social-button" type="button" disabled={busy !== null} onClick={() => void social("github")}>{busy === "github" ? "GitHub দিয়ে যাচাই হচ্ছে…" : "GitHub"}</button></div>
      ) : (
        <div className="social-skeleton" aria-label="সামাজিক লগইন লোড হচ্ছে" aria-busy="true"><span /><span /></div>
      )}
      {socialProviders && (!socialProviders.google || !socialProviders.github) && <p className="social-help">যে সামাজিক লগইনটি চালু নেই, তার OAuth Client ID ও Client Secret সেট করতে হবে।</p>}
      <p className="auth-switch">অ্যাকাউন্ট নেই? <Link href="/signup">নতুন অ্যাকাউন্ট তৈরি করুন</Link></p>
    </section>
  );
}

export default function SignInPage() {
  return <><main className="auth-shell"><Suspense fallback={<AuthSkeleton />}><SignInForm /></Suspense></main><SiteFooter /></>;
}
