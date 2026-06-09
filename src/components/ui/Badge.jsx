const statusClasses = {
  Disponible: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Alquilado: 'bg-amber-50 text-amber-700 ring-amber-200',
  Mantenimiento: 'bg-red-50 text-red-700 ring-red-200',
}

function Badge({ children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusClasses[children] || 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {children}
    </span>
  )
}

export default Badge
