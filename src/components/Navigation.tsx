import { Link, useLocation } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/predictor', label: 'Predictor' },
  { path: '/model', label: 'Model Info' },
  { path: '/about', label: 'About' },
]

export function Navigation() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-text-primary leading-tight">OncoPredict</div>
              <div className="text-xs text-text-secondary">AI Treatment Decision Support</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  location.pathname === item.path
                    ? "nav-active"
                    : "text-text-secondary hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            className="md:hidden text-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border-light">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block w-full text-left px-4 py-2 rounded-lg text-sm font-medium",
                  location.pathname === item.path
                    ? "nav-active"
                    : "text-text-secondary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
