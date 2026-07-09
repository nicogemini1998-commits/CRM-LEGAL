import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-[#8F7EE9] transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center text-white text-xs font-bold">I</div>
            IURALEX
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-xs text-slate-500">
            <Link href="/about" className="hover:text-slate-800 transition-colors">Acerca de</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacidad</Link>
            <Link href="/terms" className="hover:text-slate-800 transition-colors">Términos</Link>
            <Link href="/support" className="hover:text-slate-800 transition-colors">Soporte</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} HBD Revolution S.L. — Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-600 transition-colors">Acerca de</Link>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacidad</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Términos</Link>
            <Link href="/support" className="hover:text-slate-600 transition-colors">Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
