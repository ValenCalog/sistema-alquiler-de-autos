import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-[var(--color-accent)] text-white hover:bg-red-800',
  secondary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]',
  outline:
    'border border-[var(--color-border-strong)] bg-white text-[var(--color-primary)] hover:bg-slate-50',
  ghost: 'text-[var(--color-primary)] hover:bg-slate-100',
}

function Button({
  children,
  className = '',
  to,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const classes = `inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
