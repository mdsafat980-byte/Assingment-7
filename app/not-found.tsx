import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <main className="not-found">
        <div>
          <h1>৪০৪</h1>
          <h2>পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h2>
          <p>ঠিকানাটি পরীক্ষা করে আবার চেষ্টা করুন।</p>
          <Link className="button button-primary" href="/">
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </main>
    </>
  );
}
