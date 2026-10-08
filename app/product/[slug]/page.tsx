import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProductDetail } from "@/components/product-detail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/signin?callbackURL=${encodeURIComponent(`/product/${slug}`)}&reason=protected`);

  return <><ProductDetail slug={slug} /> </>;
}
