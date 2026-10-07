"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authClient } from "@/lib/auth-client";

export default function UpdateProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session?.user.name) setName(session.user.name);
  }, [session?.user.name]);

  useEffect(() => {
    if (!isPending && !session) {
      toast("তথ্য আপডেট করতে আগে সাইন ইন করুন।");
      router.replace("/signin?reason=protected&callbackURL=%2Fprofile%2Fupdate");
    }
  }, [isPending, router, session]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await authClient.updateUser({ name: name.trim() });
      if (result.error) {
        toast.error(result.error.message ?? "তথ্য আপডেট করা যায়নি");
        return;
      }
      toast.success("আপনার নাম আপডেট হয়েছে।");
      router.push("/profile");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "তথ্য আপডেট করা যায়নি");
    } finally {
      setBusy(false);
    }
  }

  if (isPending || !session) return <><SiteHeader /><main className="container"><div className="profile-card">লোড হচ্ছে…</div></main><SiteFooter /></>;

  return <><SiteHeader /><main className="container">
    <section className="profile-card"><div className="section-kicker"><Link href="/profile">আমার প্রোফাইল</Link> / তথ্য আপডেট</div><h1>তথ্য আপডেট করুন</h1>
      <form onSubmit={submit} style={{ marginTop: 23 }}>
        <label className="form-field">নাম<input type="text" autoComplete="name" maxLength={80} minLength={2} required value={name} onChange={(event) => setName(event.target.value)} /></label>
        <button className="button button-primary" disabled={busy}>{busy ? "আপডেট হচ্ছে…" : "তথ্য আপডেট করুন"}</button>
      </form>
    </section>
  </main><SiteFooter /></>;
}
