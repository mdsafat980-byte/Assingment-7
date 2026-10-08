import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?reason=protected&callbackURL=%2Fprofile");

  return <><main className="container">
    <section className="profile-card">
      <div className="section-kicker">আপনার অ্যাকাউন্ট</div><h1>আমার প্রোফাইল</h1>
      <div className="profile-row"><span>নাম</span><strong>{session.user.name}</strong></div>
      <div className="profile-row"><span>ইমেইল</span><strong>{session.user.email}</strong></div>
      <div style={{ marginTop: 20 }}><Link className="button button-primary" href="/profile/update">তথ্য আপডেট করুন</Link></div>
    </section>
  </main> </>;
}
