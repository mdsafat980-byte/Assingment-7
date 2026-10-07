export function ProductLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="market-grid" aria-label="পণ্য লোড হচ্ছে" aria-busy="true">
      {Array.from({ length: count }, (_, index) => <div className="skeleton" key={index} />)}
    </div>
  );
}
