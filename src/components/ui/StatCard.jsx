function StatCard({ label, value, detail }) {
  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[var(--color-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-bold text-[var(--color-primary)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{detail}</p>
    </article>
  )
}

export default StatCard
