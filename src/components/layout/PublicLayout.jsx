import { Outlet } from 'react-router-dom'
import Header from './Header'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <Outlet />
    </div>
  )
}

export default PublicLayout
