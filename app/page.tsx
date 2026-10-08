import { MarketHome } from "@/components/market-home";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <MarketHome />
      <SiteFooter />
    </>
  );
}
