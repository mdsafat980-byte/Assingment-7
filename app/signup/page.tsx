"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { SiteFooter } from "@/components/site-footer";
import { type SocialProvider, useSocialProviders } from "@/components/use-social-providers";
import { authClient, SOCIAL_AUTH_PENDING_KEY } from "@/lib/auth-client";

function SocialButtonIcon({ provider }: { provider: SocialProvider }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="#4285F4" d="M21.6 12.23c0-.7-.06-1.37-.18-2.02H12v3.82h5.39a4.6 4.6 0 0 1-1.99 3.02v2.5h3.22c1.89-1.74 2.98-4.31 2.98-7.32Z"/>
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.22-2.5c-.9.6-2.06.96-3.39.96-2.6 0-4.81-1.75-5.6-4.11H.76v2.6A10 10 0 0 0 12 22Z"/>
        <path fill="#FBBC05" d="M6.4 19.9c-.48-.9-.75-1.9-.75-3.03V14.2H2.3a9.94 9.94 0 0 0 0 8.92l4.1-3.22Z"/>
        <path fill="#EA4335" d="M12 5.86c1.47 0 2.79.5 3.83 1.48l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-9.24 5.4l4.35 3.38A5.98 5.98 0 0 1 12 5.86Z"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.12.82-.27.82-.6v-2.11c-3.33.73-4.03-1.61-4.03-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.06 1.82 2.78 1.29 3.46.99.11-.77.41-1.29.75-1.59-2.66-.3-5.46-1.33-5.46-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1-.32 3.3 1.23A11.4 11.4 0 0 1 12 6.84c1.02 0 2.05.14 3.01.41 2.29-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.61-5.48 5.91.43.37.81 1.11.81 2.25v3.33c0 .33.22.73.83.6A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
    </svg>
  );
}

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
      window.sessionStorage.setItem(
        SOCIAL_AUTH_PENDING_KEY,
        JSON.stringify({ flow: "signup", startedAt: Date.now() }),
      );
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/?auth=signup",
      });
      if (result.error) {
        window.sessionStorage.removeItem(SOCIAL_AUTH_PENDING_KEY);
        toast.error(result.error.message ?? `${provider} দিয়ে নিবন্ধন করা যায়নি`);
      }
    } catch (error) {
      window.sessionStorage.removeItem(SOCIAL_AUTH_PENDING_KEY);
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
        <div className="social-row">
          <button className="social-button" type="button" disabled={busy !== null} onClick={() => void social("google")}>
            <span className="social-button-icon"><SocialButtonIcon provider="google" /></span>
            <span>{busy === "google" ? "Google দিয়ে যাচাই হচ্ছে…" : "Google"}</span>
          </button>
          <button className="social-button" type="button" disabled={busy !== null} onClick={() => void social("github")}>
            <span className="social-button-icon"><SocialButtonIcon provider="github" /></span>
            <span>{busy === "github" ? "GitHub দিয়ে যাচাই হচ্ছে…" : "GitHub"}</span>
          </button>
        </div>
      ) : (
        <div className="social-skeleton" aria-label="সামাজিক লগইন লোড হচ্ছে" aria-busy="true"><span /><span /></div>
      )}
      {socialProviders && (!socialProviders.google || !socialProviders.github) && <p className="social-help">যে সামাজিক লগইনটি চালু নেই, তার OAuth Client ID ও Client Secret সেট করতে হবে।</p>}
      <p className="auth-switch">আগেই অ্যাকাউন্ট আছে? <Link href="/signin">সাইন ইন করুন</Link></p>
    </section>
  </main><SiteFooter /></>;
}
