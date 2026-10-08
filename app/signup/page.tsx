"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { SiteFooter } from "@/components/site-footer";
import { type SocialProvider, useSocialProviders } from "@/components/use-social-providers";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | "github" | null>(null);
  const socialProviders = useSocialProviders();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("email");
    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) {
        toast.error(result.error.message ?? "অ্যাকাউন্ট তৈরি করা যায়নি");
        return;
      }
      toast.success("অ্যাকাউন্ট তৈরি হয়েছে। এখন সাইন ইন করুন।");
      router.push("/signin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "নিবন্ধন করা যায়নি");
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
        callbackURL: "/?auth=signup",
      });
      if (result.error) toast.error(result.error.message ?? `${provider} দিয়ে নিবন্ধন করা যায়নি`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${provider} দিয়ে নিবন্ধন করা যায়নি`);
    } finally {
      setBusy(null);
    }
  }

  function handleInvalid(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.error("নাম, সঠিক ইমেইল ও কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন।", { id: "signup-validation" });
  }

  return <><main className="auth-shell">
    <section className="auth-card">
      <div className="auth-brand"><span className="auth-brand-icon"><Image src="/logo-icon.png" width={34} height={34} alt="" /></span></div>
      <h1>সাইন আপ করুন</h1><p className="auth-description">বাজারদরের হালনাগাদ তথ্য পেতে অ্যাকাউন্ট তৈরি করুন।</p>
      <form onSubmit={submit} onInvalid={handleInvalid}>
        <label className="form-field">নাম<input name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} disabled={busy !== null} value={name} onChange={(event) => setName(event.target.value)} placeholder="আপনার নাম" /></label>
        <label className="form-field">ইমেইল<input name="email" type="email" autoComplete="email" required disabled={busy !== null} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="আপনার ইমেইল" /></label>
        <label className="form-field">পাসওয়ার্ড<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required disabled={busy !== null} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="কমপক্ষে ৮ অক্ষর" /></label>
        <button className="button button-primary auth-submit" disabled={busy !== null}>{busy === "email" && <span className="auth-spinner" aria-hidden="true" />}{busy === "email" ? "অ্যাকাউন্ট তৈরি হচ্ছে…" : "সাইন আপ"}</button>
      </form>
      <div className="auth-divider">অথবা চালিয়ে যান</div>
      {socialProviders ? (
        <div className="social-row"><button className="social-button" type="button" disabled={busy !== null} onClick={() => void social("google")}>{busy === "google" ? "Google দিয়ে যাচাই হচ্ছে…" : "Google"}</button><button className="social-button" type="button" disabled={busy !== null} onClick={() => void social("github")}>{busy === "github" ? "GitHub দিয়ে যাচাই হচ্ছে…" : "GitHub"}</button></div>
      ) : (
        <div className="social-skeleton" aria-label="সামাজিক লগইন লোড হচ্ছে" aria-busy="true"><span /><span /></div>
      )}
      {socialProviders && (!socialProviders.google || !socialProviders.github) && <p className="social-help">যে সামাজিক লগইনটি চালু নেই, তার OAuth Client ID ও Client Secret সেট করতে হবে।</p>}
      <p className="auth-switch">আগেই অ্যাকাউন্ট আছে? <Link href="/signin">সাইন ইন করুন</Link></p>
    </section>
  </main><SiteFooter /></>;
}
