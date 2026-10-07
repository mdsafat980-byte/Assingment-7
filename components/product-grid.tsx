import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/market";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <div className="empty-box">এই খোঁজে কোনো পণ্য পাওয়া যায়নি।</div>;
  }
  return <div className="market-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
