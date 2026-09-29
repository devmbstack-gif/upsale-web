export default function SuperAdminHome() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,58,237,0.35), transparent), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(196,181,253,0.15), transparent)",
        }}
        aria-hidden
      />
      <div className="relative z-10 max-w-lg text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">UPSale</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
          Super Admin
        </h1>
        <p className="mt-4 text-muted">
          Platform console placeholder. Business Owner Dashboard lives in the{" "}
          <strong className="text-foreground">frontend</strong> app on port 3000.
        </p>
        <p className="mt-6 text-sm text-muted">
          Open{" "}
          <a className="text-[var(--brand-to)] underline" href="http://localhost:3000">
            http://localhost:3000
          </a>{" "}
          for owner login, offers, customers, and QR tools.
        </p>
      </div>
    </main>
  );
}
