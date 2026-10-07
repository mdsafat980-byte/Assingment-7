import Link from "next/link";
import { type Product, getChangeLabel, priceLabel, unitLabel } from "@/lib/market";

export function ProductCard({ product }: { product: Product }) {
  const directionClass =
    product.change.dir === "up" ? "change-up" : product.change.dir === "down" ? "change-down" : "change-flat";

  return (
    <Link className="product-card" href={`/product/${product.slug}`} aria-label={`${product.nameBn} বিস্তারিত`}>
      <div className="product-card-top">
        <span className="product-emoji" aria-hidden="true">{product.image || product.categoryIcon}</span>
        <span className={`change-badge ${directionClass}`}>{getChangeLabel(product.change)}</span>
      </div>
      <h3 className="product-name">{product.nameBn}</h3>
      <div className="product-unit">{unitLabel(product.unit)}</div>
      <div className="price-row">
        <div>
          <div className="price-caption">আজকের দাম</div>
          <div className="product-price">{priceLabel(product.today)}</div>
        </div>
        <span className="price-caption">বাজারদর</span>
      </div>
    </Link>
  );
}
