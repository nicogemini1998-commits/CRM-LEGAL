export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D0F] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[520px] flex-col justify-between bg-[#0A0A0D] border-r border-neutral-800/60 p-12 relative overflow-hidden flex-shrink-0">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-800/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D6BE4] to-[#1a4fc7] flex items-center justify-center shadow-xl shadow-blue-500/25">
              <span className="text-white text-sm font-bold tracking-tight">Iα</span>
            </div>
            <div>
              <span className="text-[20px] font-bold text-white tracking-[-0.03em]">IURALEX</span>
              <p className="text-[11px] text-neutral-500 leading-none font-medium">by Cliender</p>
            </div>
          </div>
        </div>

        {/* Tagline central */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
              La IA que entiende<br />
              el derecho español.
            </h1>
            <p className="text-neutral-400 mt-4 text-[15px] leading-relaxed">
              Análisis de contratos, generación de escritos y gestión de expedientes — todo en un solo lugar, blindado con IA.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3">
            {[
              'Análisis de contratos con detección de riesgos',
              'Generación automática de contratos en segundos',
              'Asistente jurídico especializado en derecho español',
              'Gestión de expedientes y CRM de clientes',
              'Cumplimiento RGPD/LOPD nativo · Servidores UE',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-neutral-400">{feature}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="pt-4 border-t border-neutral-800/60">
            <p className="text-[12px] text-neutral-600">
              Desarrollado por <span className="text-neutral-400 font-semibold">Cliender</span> · Automatización e IA · España 🇪🇸
            </p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { value: '40%', label: 'menos trabajo admin' },
            { value: '65%', label: 'bufetes sin digitalizar' },
            { value: '100%', label: 'RGPD compliant' },
          ].map((stat) => (
            <div key={stat.label} className="bg-neutral-900/60 border border-neutral-800/60 rounded-xl p-3">
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-neutral-600 leading-tight mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D6BE4] to-[#1a4fc7] flex items-center justify-center">
              <span className="text-white text-xs font-bold">Iα</span>
            </div>
            <div>
              <span className="text-[17px] font-bold text-white tracking-[-0.02em]">IURALEX</span>
              <p className="text-[10px] text-neutral-500 leading-none">by Cliender</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
