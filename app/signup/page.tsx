"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { SiteFooter } from "@/components/site-footer";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
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
      setBusy(false);
    }
  }

  async function social(provider: "google" | "github") {
    try {
      const result = await authClient.signIn.social({ provider, callbackURL: "/" });
      if (result.error) toast.error(result.error.message ?? `${provider} দিয়ে নিবন্ধন করা যায়নি`);
    } catch {
      toast.error(`${provider} লগইনের জন্য OAuth credentials সেট করা নেই বা নিবন্ধন ব্যর্থ হয়েছে।`);
    }
  }

  return <><main className="auth-shell">
    <section className="auth-card">
      <div className="auth-brand"><Image src="/bazar-dor-logo.png" width={43} height={43} alt="" /></div>
      <h1>নতুন অ্যাকাউন্ট</h1><p className="auth-description">বাজারদরের হালনাগাদ তথ্য পেতে যোগ দিন।</p>
      <form onSubmit={submit}>
        <label className="form-field">নাম<input type="text" autoComplete="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="আপনার নাম" /></label>
        <label className="form-field">ইমেইল<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="আপনার ইমেইল" /></label>
        <label className="form-field">পাসওয়ার্ড<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="কমপক্ষে ৮ অক্ষর" /></label>
        <button className="button button-primary auth-submit" disabled={busy}>{busy ? "অ্যাকাউন্ট তৈরি হচ্ছে…" : "সাইন আপ"}</button>
      </form>
      <div className="auth-divider">অথবা চালিয়ে যান</div>
      <div className="social-row"><button className="social-button" type="button" onClick={() => void social("google")}>Google</button><button className="social-button" type="button" onClick={() => void social("github")}>GitHub</button></div>
      <p className="auth-switch">আগেই অ্যাকাউন্ট আছে? <Link href="/signin">সাইন ইন করুন</Link></p>
    </section>
  </main><SiteFooter /></>;
}
