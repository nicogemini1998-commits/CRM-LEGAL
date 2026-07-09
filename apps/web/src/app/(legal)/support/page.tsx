import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Soporte — IURALEX',
  description: 'Centro de soporte de IURALEX. Contacto, tiempos de respuesta y preguntas frecuentes.',
}

const FAQ = [
  {
    q: '¿Cómo inicio sesión en IURALEX?',
    a: 'Acceda a la URL de su despacho e introduzca el correo y contraseña con los que se registró. Si ha olvidado su contraseña, use el enlace «¿Olvidaste tu contraseña?» en la pantalla de acceso para recibir un correo de restablecimiento.',
  },
  {
    q: '¿LEXIA puede cometer errores?',
    a: 'Sí. LEXIA es un asistente basado en IA y puede generar información incorrecta o citas normativas inexistentes («alucinaciones»). Siempre contraste las referencias legales con fuentes oficiales (BOE, CENDOJ, bases de datos jurídicas). Los análisis de LEXIA son orientativos y no sustituyen el criterio profesional.',
  },
  {
    q: '¿Mis documentos y expedientes están seguros?',
    a: 'Todos los datos se almacenan cifrados con AES-256-GCM en reposo y TLS 1.3 en tránsito. Cada despacho tiene sus datos completamente aislados del resto. Realizamos copias de seguridad diarias con retención de 30 días. Consulte nuestra Política de Privacidad para más detalles.',
  },
  {
    q: '¿Anthropic tiene acceso a mis expedientes?',
    a: 'Los documentos que analiza LEXIA se envían a la API de Anthropic para su procesamiento. Anthropic no usa estos datos para entrenar sus modelos según el acuerdo de uso de API de empresa. La transferencia está amparada en Cláusulas Contractuales Tipo (SCCs). Ver Política de Privacidad, sección 4.',
  },
  {
    q: '¿Puedo exportar mis datos si quiero cancelar?',
    a: 'Sí. Puede exportar todos sus expedientes, documentos y datos de clientes en formato JSON y PDF desde Configuración → Exportar datos, antes de cancelar la suscripción. Tras la cancelación, los datos se conservan durante 30 días y después se eliminan de forma segura.',
  },
  {
    q: '¿Cómo añado miembros a mi despacho?',
    a: 'Vaya a Panel → Equipo → Invitar miembro. Introduzca el correo del nuevo usuario, asigne su rol (Abogado, Paralegal, Administrador) y defina sus permisos. El usuario recibirá un correo de invitación con instrucciones para activar su cuenta.',
  },
  {
    q: '¿Puedo usar IURALEX desde el móvil?',
    a: 'IURALEX está optimizado para navegadores de escritorio (Chrome, Firefox, Edge, Safari). La interfaz es responsive y funciona en tablet y móvil, aunque la experiencia completa está diseñada para pantallas grandes.',
  },
  {
    q: '¿Qué ocurre si subo un documento en PDF?',
    a: 'IURALEX extrae el texto del PDF usando OCR cuando es necesario, lo clasifica automáticamente (sentencia, contrato, demanda, etc.) y lo vincula al expediente seleccionado. El análisis IA está disponible desde la ficha del documento.',
  },
  {
    q: '¿Cómo se factura IURALEX?',
    a: 'La suscripción se factura mensualmente por adelantado según el número de abogados activos en su despacho. Recibirá la factura por correo electrónico al inicio de cada ciclo. Puede gestionar su suscripción desde Configuración → Facturación.',
  },
  {
    q: '¿IURALEX está homologado para firma electrónica?',
    a: 'La función de firma electrónica usa Signaturit, proveedor de firma electrónica cualificada bajo el Reglamento eIDAS. Las firmas tienen plena validez jurídica en España y la UE conforme a la Ley 59/2003.',
  },
]

export default function SupportPage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Centro de soporte</h1>
        <p className="text-slate-500 text-lg">
          Estamos aquí para ayudarle. Encuentre respuestas rápidas o contáctenos directamente.
        </p>
      </div>

      {/* Canales de contacto */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-5">Cómo contactarnos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              ),
              title: 'Correo electrónico',
              desc: 'Soporte técnico y consultas generales',
              value: 'soporte@cliender.com',
              href: 'mailto:soporte@cliender.com',
              badge: null,
            },
            {
              icon: (
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              ),
              title: 'Chat en la app',
              desc: 'Disponible dentro de IURALEX',
              value: 'Icono de chat → esquina inferior derecha',
              href: null,
              badge: 'En vivo',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ),
              title: 'Asuntos legales',
              desc: 'Privacidad, RGPD, contratos',
              value: 'legal@cliender.com',
              href: 'mailto:legal@cliender.com',
              badge: null,
            },
          ].map(({ icon, title, desc, value, href, badge }) => (
            <div key={title} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-violet-50 rounded-xl">{icon}</div>
                {badge && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <div className="font-semibold text-slate-800 mb-1">{title}</div>
              <div className="text-sm text-slate-500 mb-2">{desc}</div>
              {href ? (
                <a href={href} className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
                  {value}
                </a>
              ) : (
                <span className="text-sm text-slate-600">{value}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tiempos de respuesta */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-5">Tiempos de respuesta</h2>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Tipo de incidencia</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Prioridad</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Tiempo de respuesta</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Resolución objetivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Plataforma caída / sin acceso', 'Crítica', '< 2 horas', '< 8 horas'],
                ['Error que impide trabajar (datos perdidos, bug bloqueante)', 'Alta', '< 4 horas hábiles', '< 24 horas hábiles'],
                ['Error funcional con solución temporal disponible', 'Media', '< 1 día hábil', '< 5 días hábiles'],
                ['Duda o consulta de uso', 'Normal', '< 2 días hábiles', 'N/A'],
                ['Solicitud de nueva funcionalidad', 'Baja', '< 5 días hábiles', 'Según roadmap'],
              ].map(([tipo, prio, resp, resol]) => (
                <tr key={tipo}>
                  <td className="py-3 px-4 text-slate-700">{tipo}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      prio === 'Crítica' ? 'bg-red-100 text-red-700' :
                      prio === 'Alta' ? 'bg-orange-100 text-orange-700' :
                      prio === 'Media' ? 'bg-yellow-100 text-yellow-700' :
                      prio === 'Normal' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {prio}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{resp}</td>
                  <td className="py-3 px-4 text-slate-500">{resol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Horario de atención: lunes a viernes de 09:00 a 18:00 (hora peninsular española). Incidencias críticas: atendidas 24/7.
        </p>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-5">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }, i) => (
            <details key={i} className="group border border-slate-200 rounded-xl bg-white overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none text-slate-800 font-medium text-sm hover:bg-slate-50 transition-colors">
                <span>{q}</span>
                <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 pt-2 text-sm text-slate-600 border-t border-slate-100">{a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="p-8 bg-gradient-to-br from-violet-50 to-slate-50 rounded-2xl border border-violet-200 text-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">¿No encuentra lo que busca?</h3>
        <p className="text-slate-500 text-sm mb-5">
          Nuestro equipo está disponible para ayudarle con cualquier duda técnica o consulta sobre el servicio.
        </p>
        <a
          href="mailto:soporte@cliender.com"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Enviar mensaje
        </a>
      </section>
    </div>
  )
}
