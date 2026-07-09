import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acerca de IURALEX | Cliender Tech',
  description: 'Conoce IURALEX, el asistente jurídico con IA para despachos de abogados españoles.',
}

export default function AboutPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8F7EE9] mb-3">Acerca de</p>
        <h1 className="text-4xl font-serif font-semibold text-slate-900 leading-tight">IURALEX</h1>
        <p className="mt-3 text-lg text-slate-600 leading-relaxed max-w-2xl">
          La inteligencia artificial diseñada para el ejercicio de la abogacía en España.
        </p>
      </div>

      {/* Qué es */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">¿Qué es IURALEX?</h2>
        <p className="text-slate-600 leading-relaxed">
          IURALEX es un software de gestión jurídica asistida por inteligencia artificial, desarrollado y
          comercializado por <strong className="text-slate-800">HBD Revolution S.L.</strong> bajo la marca
          <strong className="text-slate-800"> Cliender Tech</strong>. Está especialmente diseñado para despachos
          de abogados, procuradores y gestorías jurídicas con sede en España.
        </p>
        <p className="text-slate-600 leading-relaxed">
          La plataforma integra LEXIA, un asistente jurídico conversacional basado en modelos de lenguaje de
          última generación, entrenado y ajustado para el ordenamiento jurídico español: Código Civil, Estatuto
          de los Trabajadores, Ley Orgánica del Poder Judicial, normativa procesal y sectorial.
        </p>
      </section>

      {/* Funcionalidades */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Funcionalidades principales</h2>
        <ul className="space-y-3 text-slate-600">
          {[
            'Gestión completa de expedientes, clientes y documentos.',
            'Análisis automático de documentos jurídicos con detección de riesgos ALTO / MEDIO / BAJO.',
            'Generación asistida de contratos, escritos y otros documentos legales.',
            'Chat jurídico con LEXIA: preguntas sobre legislación vigente con citas de artículos exactos.',
            'Control de plazos procesales y alertas de vencimiento.',
            'Módulo de facturación, honorarios y presupuestos.',
            'Gestión de equipos con roles y permisos diferenciados.',
          ].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span className="mt-1 w-4 h-4 flex-shrink-0 rounded-full bg-[#8F7EE9]/15 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-[#8F7EE9]" fill="currentColor" viewBox="0 0 8 8">
                  <path d="M6.5 1.5L3 5 1.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Datos identificativos del responsable */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Datos identificativos del titular</h2>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          En cumplimiento del art. 10 LSSI-CE (Ley 34/2002)
        </p>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {[
            ['Denominación social', 'HBD Revolution S.L.'],
            ['Nombre comercial', 'Cliender Tech · IURALEX'],
            ['CIF', 'B-[NÚMERO REGISTRAL]'],
            ['Domicilio social', 'Sagunto (Valencia), España'],
            ['Actividad', 'Desarrollo y comercialización de software jurídico (CNAE 6201)'],
            ['Registro Mercantil', 'Registro Mercantil de Valencia'],
            ['Correo de contacto', 'legal@cliender.com'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</dt>
              <dd className="text-slate-800 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Tecnología */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Tecnología y tratamiento de datos</h2>
        <p className="text-slate-600 leading-relaxed">
          IURALEX procesa los datos introducidos por el usuario (expedientes, documentos, comunicaciones) para
          prestar el servicio contratado. El motor de IA utiliza modelos de lenguaje de terceros (Anthropic, Inc.)
          con los que HBD Revolution S.L. mantiene acuerdos de procesamiento de datos adecuados al RGPD.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Ningún dato de clientes del despacho es utilizado para entrenar modelos de IA propios o de terceros.
          Los datos se cifran en tránsito (TLS 1.3) y en reposo (AES-256). Las copias de seguridad se realizan
          diariamente con retención de 30 días.
        </p>
      </section>

      {/* Versión */}
      <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
        IURALEX v1.0 · © {new Date().getFullYear()} HBD Revolution S.L. · Última revisión: mayo 2026
      </p>
    </div>
  )
}
