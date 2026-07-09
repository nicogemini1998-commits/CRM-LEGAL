import { ClienderLogo } from '@/components/brand/ClienderLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#FAFAF9' }}>
      {/* ── Left panel (55%) — Dark Navy brand hero ───────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-14 relative overflow-hidden flex-shrink-0"
        style={{ width: '55%', background: '#1E2839', color: '#fff' }}
      >
        {/* Purple atmosphere */}
        <div
          className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none"
          style={{ background: 'rgba(143,126,233,0.18)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"
          style={{ background: 'rgba(143,126,233,0.10)' }}
        />

        {/* Top — Cliender brand lockup */}
        <div className="relative z-10">
          <ClienderLogo variant="full" color="purple" size={40} />
        </div>

        {/* Center — IURALEX headline */}
        <div className="relative z-10 space-y-7">
          <div>
            <h1
              className="leading-[0.95] tracking-[-0.04em]"
              style={{
                fontFamily: 'var(--font-instrument), Georgia, serif',
                fontSize: 84,
                color: '#fff',
              }}
            >
              IURALEX
            </h1>
            <p className="text-[18px] mt-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
              La IA jurídica de{' '}
              <span style={{ color: '#8F7EE9', fontWeight: 600 }}>Cliender Tech</span>.
              <br />
              Análisis de contratos, escritos automáticos y gestión de expedientes — en un solo lugar.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 pt-2">
            {[
              'Análisis de contratos con detección de riesgos',
              'Generación automática de escritos en segundos',
              'Asistente jurídico especializado en derecho español',
              'CRM de clientes y expedientes integrado',
              'Cumplimiento RGPD nativo · Servidores UE',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(143,126,233,0.18)', border: '1px solid rgba(143,126,233,0.45)' }}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="#8F7EE9" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13.5px]" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — stats */}
        <div className="relative z-10">
          <div
            className="flex items-center gap-5 text-[13px] font-medium"
            style={{ color: 'rgba(255,255,255,0.78)' }}
          >
            <span><strong style={{ color: '#fff' }}>40%</strong> menos trabajo</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span><strong style={{ color: '#fff' }}>100%</strong> RGPD</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span style={{ color: '#8F7EE9', fontWeight: 600 }}>IA Cliender</span>
          </div>
        </div>
      </div>

      {/* ── Right panel (45%) — Form ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#FAFAF9' }}>
        <div className="w-full max-w-[420px]">
          {/* Top — Cliender symbol */}
          <div className="flex items-center gap-3 mb-10">
            <ClienderLogo variant="symbol" color="purple" size={28} />
            <div className="h-6 w-px" style={{ background: '#E7E5E4' }} />
            <span
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: '#14181E' }}
            >
              IURALEX
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
