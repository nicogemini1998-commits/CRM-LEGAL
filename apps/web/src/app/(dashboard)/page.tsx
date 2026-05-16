import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StaggerChildren, StaggerItem, FadeIn } from '@/components/ui/page-transition'

async function getDashboardStats(userId: string) {
  const supabase = createServerClient()
  const [casesRes, docsRes, clientsRes] = await Promise.all([
    supabase.from('cases').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('documents').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('deleted_at', null),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ])
  return {
    cases: casesRes.count ?? 0,
    documents: docsRes.count ?? 0,
    clients: clientsRes.count ?? 0,
  }
}

export default async function DashboardPage() {
  const session = await auth().catch(() => null)
  let stats = { cases: 0, documents: 0, clients: 0 }
  try {
    if (session?.user?.id) stats = await getDashboardStats(session.user.id)
  } catch { /* DB no configurada en dev */ }

  const firstName = session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0] || 'Abogado'

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="text-4xl font-bold text-neutral-100">Hola, {firstName}</h1>
        <p className="text-lg text-neutral-500 mt-1.5">Tu despacho en un vistazo</p>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StaggerItem>
          <Link href="/cases" className="block bg-neutral-900 rounded-2xl border border-neutral-800 p-6 hover:border-neutral-700 hover:bg-neutral-800/70 transition-all duration-200 group">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-neutral-100">{stats.cases}</div>
                <p className="text-neutral-400 mt-1.5 font-medium">Casos activos</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/documents" className="block bg-neutral-900 rounded-2xl border border-neutral-800 p-6 hover:border-neutral-700 hover:bg-neutral-800/70 transition-all duration-200 group">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-neutral-100">{stats.documents}</div>
                <p className="text-neutral-400 mt-1.5 font-medium">Documentos</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/clients" className="block bg-neutral-900 rounded-2xl border border-neutral-800 p-6 hover:border-neutral-700 hover:bg-neutral-800/70 transition-all duration-200 group">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-neutral-100">{stats.clients}</div>
                <p className="text-neutral-400 mt-1.5 font-medium">Clientes</p>
              </div>
              <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center group-hover:bg-violet-500/20 transition">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </Link>
        </StaggerItem>
      </StaggerChildren>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StaggerItem>
          <Link
            href="/documents"
            className="flex items-center justify-between bg-neutral-100 text-neutral-900 rounded-2xl p-6 hover:bg-white transition-all duration-200 group"
          >
            <div>
              <h2 className="font-semibold text-lg">Analizar documento con IA</h2>
              <p className="text-neutral-500 text-sm mt-1">Sube un contrato y Claude lo analiza en segundos</p>
            </div>
            <svg className="w-6 h-6 text-neutral-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link
            href="/generate"
            className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 hover:bg-neutral-800/70 transition-all duration-200 group"
          >
            <div>
              <h2 className="font-semibold text-lg text-neutral-100">Generar contrato</h2>
              <p className="text-neutral-500 text-sm mt-1">NDA, compraventa, arrendamiento y más</p>
            </div>
            <svg className="w-6 h-6 text-neutral-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </StaggerItem>
      </StaggerChildren>
    </div>
  )
}
