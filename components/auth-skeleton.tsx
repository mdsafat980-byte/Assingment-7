export function AuthSkeleton() {
  return (
    <section className="auth-card auth-skeleton" aria-label="অথেন্টিকেশন ফর্ম লোড হচ্ছে" aria-busy="true">
      <div className="auth-skeleton-mark" />
      <div className="auth-skeleton-line auth-skeleton-title" />
      <div className="auth-skeleton-line auth-skeleton-description" />
      <div className="auth-skeleton-line auth-skeleton-field" />
      <div className="auth-skeleton-line auth-skeleton-field" />
      <div className="auth-skeleton-line auth-skeleton-submit" />
      <div className="auth-skeleton-socials">
        <div className="auth-skeleton-line" />
        <div className="auth-skeleton-line" />
      </div>
    </section>
  );
}
