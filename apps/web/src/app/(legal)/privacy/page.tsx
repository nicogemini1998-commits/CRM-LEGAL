import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — IURALEX',
  description: 'Información sobre el tratamiento de sus datos personales conforme al RGPD y la LOPDGDD.',
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-slate-500 mb-10">
        Última actualización: 22 de mayo de 2026 · Versión 1.0
      </p>

      {/* 1. Responsable */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Responsable del tratamiento</h2>
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Razón social', 'HBD Revolution S.L. (marca comercial: Cliender Tech)'],
                ['CIF', 'B-XXXXXXXXX (sustituir antes de producción)'],
                ['Domicilio', 'C/ [Calle], [Número], 46500 Sagunto, Valencia, España'],
                ['Correo de contacto', 'legal@cliender.com'],
                ['Delegado de Protección de Datos', 'dpo@cliender.com'],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-slate-200 last:border-0">
                  <td className="py-3 px-4 font-medium text-slate-600 w-56 bg-slate-50">{k}</td>
                  <td className="py-3 px-4 text-slate-800">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Qué datos */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Datos personales que tratamos</h2>
        <p className="text-slate-600 mb-4">
          En función del uso que haga de IURALEX, podemos tratar las siguientes categorías de datos:
        </p>
        <ul className="space-y-2 text-slate-700">
          {[
            'Datos de identificación y contacto del usuario (nombre, apellidos, correo electrónico, teléfono).',
            'Datos de la cuenta: dirección de correo, contraseña cifrada (bcrypt), rol y permisos.',
            'Datos de los expedientes y clientes que el despacho introduce en la plataforma, que pueden incluir datos personales de terceros (partes, testigos, peritos).',
            'Documentos cargados a la plataforma (contratos, demandas, sentencias, etc.).',
            'Datos de uso y telemetría técnica: dirección IP, navegador, sesiones, registros de auditoría.',
            'Datos de facturación y pago cuando aplique.',
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 text-violet-500 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Datos de categoría especial:</strong> Los expedientes jurídicos pueden contener datos sobre salud, ideología, condenas penales u otras categorías especiales (art. 9 RGPD). El despacho es responsable de asegurarse de disponer de base jurídica habilitante para su tratamiento.
        </div>
      </section>

      {/* 3. Finalidades y bases jurídicas */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Finalidades y bases jurídicas del tratamiento</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Finalidad</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Base jurídica (art. 6 RGPD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Gestión de la cuenta y acceso a la plataforma', 'Ejecución de contrato (art. 6.1.b)'],
                ['Prestación del servicio de CRM jurídico', 'Ejecución de contrato (art. 6.1.b)'],
                ['Análisis IA de documentos y asistencia LEXIA', 'Ejecución de contrato (art. 6.1.b)'],
                ['Facturación y gestión económica', 'Obligación legal (art. 6.1.c) / contrato (art. 6.1.b)'],
                ['Seguridad, auditoría y prevención del fraude', 'Interés legítimo (art. 6.1.f)'],
                ['Mejora del servicio (métricas anonimizadas)', 'Interés legítimo (art. 6.1.f)'],
                ['Comunicaciones comerciales de Cliender Tech', 'Consentimiento (art. 6.1.a)'],
                ['Cumplimiento de requerimientos legales', 'Obligación legal (art. 6.1.c)'],
              ].map(([fin, base]) => (
                <tr key={fin}>
                  <td className="py-3 px-4 text-slate-700">{fin}</td>
                  <td className="py-3 px-4 text-slate-500">{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Encargados y destinatarios */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Encargados del tratamiento y destinatarios</h2>
        <p className="text-slate-600 mb-4">
          Cliender Tech actúa como <strong>encargado del tratamiento</strong> para los datos que el despacho introduce en la plataforma. Sus datos de cuenta son tratados directamente por Cliender Tech como responsable.
        </p>
        <p className="text-slate-600 mb-4">Los proveedores subcontratados con acceso a datos son:</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Proveedor</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Servicio</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Ubicación</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Garantía</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Supabase Inc.', 'Base de datos y almacenamiento', 'UE (AWS eu-west-1)', 'SCCs / BCRs'],
                ['Anthropic, PBC', 'Modelos de IA (Claude)', 'EE.UU.', 'SCCs · art. 46 RGPD'],
                ['Vercel Inc.', 'Alojamiento web', 'EE.UU. / UE', 'SCCs · art. 46 RGPD'],
                ['Signaturit Solutions S.L.', 'Firma electrónica', 'España / UE', 'UE — sin transferencia'],
              ].map(([p, s, u, g]) => (
                <tr key={p}>
                  <td className="py-3 px-4 font-medium text-slate-700">{p}</td>
                  <td className="py-3 px-4 text-slate-600">{s}</td>
                  <td className="py-3 px-4 text-slate-500">{u}</td>
                  <td className="py-3 px-4 text-slate-500">{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          SCCs = Cláusulas Contractuales Tipo aprobadas por la Comisión Europea (Decisión 2021/914/UE).
          La transferencia a Anthropic está amparada en SCCs con medidas técnicas complementarias (cifrado en tránsito y en reposo, sin retención de datos para entrenamiento de modelos).
        </p>
      </section>

      {/* 5. Plazos de conservación */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Plazos de conservación</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Categoría de datos</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Plazo</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Datos de cuenta activa', 'Duración de la relación contractual + 3 años', 'Art. 1964 CC (acciones personales)'],
                ['Expedientes y documentos', 'Duración del contrato + 5 años', 'Art. 30 CCom (libros mercantiles)'],
                ['Registros de auditoría / logs', '2 años', 'Interés legítimo de seguridad'],
                ['Datos de facturación', '5 años', 'Art. 66 LGT (prescripción fiscal)'],
                ['Comunicaciones con soporte', '3 años', 'Art. 1964 CC'],
                ['Datos para marketing (con consentimiento)', 'Hasta retirada del consentimiento', 'Art. 6.1.a RGPD'],
              ].map(([cat, plazo, base]) => (
                <tr key={cat}>
                  <td className="py-3 px-4 text-slate-700">{cat}</td>
                  <td className="py-3 px-4 text-slate-600">{plazo}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Derechos */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Derechos de los interesados</h2>
        <p className="text-slate-600 mb-4">
          De conformidad con los artículos 15-22 RGPD y el Título III de la LOPDGDD, puede ejercer los siguientes derechos:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['Acceso', 'Obtener confirmación y copia de sus datos (art. 15 RGPD).'],
            ['Rectificación', 'Corregir datos inexactos o incompletos (art. 16 RGPD).'],
            ['Supresión', 'Solicitar el borrado cuando ya no sean necesarios (art. 17 RGPD).'],
            ['Limitación', 'Restringir el tratamiento en ciertos supuestos (art. 18 RGPD).'],
            ['Portabilidad', 'Recibir sus datos en formato estructurado (art. 20 RGPD).'],
            ['Oposición', 'Oponerse al tratamiento basado en interés legítimo (art. 21 RGPD).'],
            ['No decisión automatizada', 'No ser objeto de decisiones basadas únicamente en tratamiento automatizado (art. 22 RGPD).'],
            ['Retirada de consentimiento', 'Retirar el consentimiento en cualquier momento sin efecto retroactivo.'],
          ].map(([d, desc]) => (
            <div key={d} className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="font-semibold text-slate-800 text-sm mb-1">{d}</div>
              <div className="text-xs text-slate-500">{desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-xl text-sm text-slate-700">
          <p className="mb-2">
            <strong>Cómo ejercer sus derechos:</strong> Envíe solicitud escrita a <a href="mailto:legal@cliender.com" className="text-violet-600 underline">legal@cliender.com</a> con asunto «Ejercicio de derechos RGPD», adjuntando copia de DNI/NIE u otro documento identificativo.
          </p>
          <p className="mb-2">Plazo de respuesta: <strong>1 mes</strong> desde la recepción (prorrogable 2 meses adicionales si la complejidad lo justifica, con notificación previa).</p>
          <p>
            Si considera que sus derechos no han sido atendidos, puede presentar reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" className="text-violet-600 underline" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
          </p>
        </div>
      </section>

      {/* 7. Seguridad */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">7. Medidas de seguridad</h2>
        <p className="text-slate-600 mb-4">
          Cliender Tech aplica medidas técnicas y organizativas adecuadas conforme al art. 32 RGPD:
        </p>
        <ul className="space-y-2 text-slate-700 text-sm">
          {[
            'Cifrado en tránsito: TLS 1.3 en todas las comunicaciones.',
            'Cifrado en reposo: AES-256-GCM para documentos almacenados.',
            'Contraseñas almacenadas con bcrypt (factor de coste ≥ 12).',
            'Autenticación de dos factores disponible para todos los usuarios.',
            'Control de acceso basado en roles (RBAC) con políticas RLS en base de datos.',
            'Registro de auditoría inmutable de todas las acciones críticas.',
            'Copias de seguridad diarias cifradas con retención mínima de 30 días.',
            'Evaluación periódica de vulnerabilidades y actualizaciones de dependencias.',
            'Personal con acceso a datos formado en protección de datos.',
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-violet-500 flex-shrink-0">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 8. Cookies */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">8. Cookies y tecnologías similares</h2>
        <p className="text-slate-600 mb-3">
          IURALEX utiliza cookies estrictamente necesarias para el funcionamiento de la sesión autenticada.
          No se instalan cookies de rastreo publicitario ni de análisis de terceros sin consentimiento expreso.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Cookie</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Tipo</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Finalidad</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-mono text-xs text-slate-700">iuralex.session-token</td>
                <td className="py-3 px-4 text-slate-600">Técnica / necesaria</td>
                <td className="py-3 px-4 text-slate-500">Mantener la sesión autenticada</td>
                <td className="py-3 px-4 text-slate-500">Sesión / 30 días</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs text-slate-700">csrf-token</td>
                <td className="py-3 px-4 text-slate-600">Técnica / seguridad</td>
                <td className="py-3 px-4 text-slate-500">Protección CSRF en formularios</td>
                <td className="py-3 px-4 text-slate-500">Sesión</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. Actualizaciones */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">9. Actualizaciones de esta política</h2>
        <p className="text-slate-600">
          Cliender Tech puede actualizar esta política para reflejar cambios legales, normativos o en el servicio.
          Los cambios sustanciales serán notificados por correo electrónico con al menos 30 días de antelación.
          La versión vigente siempre estará disponible en esta página con indicación de la fecha de última actualización.
        </p>
      </section>

      {/* 10. Contacto DPD */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">10. Contacto con el Delegado de Protección de Datos</h2>
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
          <p className="mb-1"><strong>HBD Revolution S.L. — Delegado de Protección de Datos</strong></p>
          <p className="mb-1">C/ [Calle], [Número], 46500 Sagunto, Valencia</p>
          <p><a href="mailto:dpo@cliender.com" className="text-violet-600 underline">dpo@cliender.com</a></p>
        </div>
      </section>
    </article>
  )
}
