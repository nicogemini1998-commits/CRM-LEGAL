import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — IURALEX',
  description: 'Condiciones generales de uso del servicio IURALEX conforme a la LSSI-CE y el derecho español.',
}

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Términos y Condiciones de Uso</h1>
      <p className="text-sm text-slate-500 mb-10">
        Última actualización: 22 de mayo de 2026 · Versión 1.0
      </p>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 mb-10">
        Lea atentamente estos Términos antes de utilizar IURALEX. El acceso o uso del servicio implica la aceptación íntegra de las presentes condiciones.
      </div>

      {/* 1. Identificación del prestador */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Identificación del prestador del servicio</h2>
        <p className="text-slate-600 mb-4">
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE):
        </p>
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Denominación social', 'HBD Revolution S.L.'],
                ['Marca comercial', 'Cliender Tech · IURALEX'],
                ['CIF', 'B-XXXXXXXXX (sustituir antes de producción)'],
                ['Domicilio social', 'C/ [Calle], [Número], 46500 Sagunto, Valencia, España'],
                ['Registro Mercantil', 'Registro Mercantil de Valencia, Tomo XX, Folio XX, Hoja V-XXXXX'],
                ['Correo electrónico', 'legal@cliender.com'],
                ['Actividad', 'Desarrollo y comercialización de software SaaS para despachos de abogados'],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-slate-200 last:border-0">
                  <td className="py-3 px-4 font-medium text-slate-600 w-52 bg-slate-50">{k}</td>
                  <td className="py-3 px-4 text-slate-800">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Objeto */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Objeto y ámbito de aplicación</h2>
        <p className="text-slate-600 mb-3">
          IURALEX es una plataforma SaaS de gestión de despachos de abogados que incorpora herramientas de inteligencia artificial para la gestión de expedientes, análisis de documentos jurídicos y asistencia legal mediante el asistente LEXIA.
        </p>
        <p className="text-slate-600">
          Estos Términos regulan el acceso y uso de la plataforma por parte de los usuarios registrados («Usuario» o «Despacho»). Son de aplicación en todo el territorio español y se rigen por la legislación española.
        </p>
      </section>

      {/* 3. Acceso y registro */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Acceso, registro y cuenta</h2>
        <ul className="space-y-3 text-slate-700 text-sm">
          {[
            'El acceso a IURALEX requiere registro previo y aceptación de estos Términos.',
            'El Usuario garantiza que los datos facilitados durante el registro son exactos, completos y actualizados.',
            'Cada cuenta es personal e intransferible. El Usuario es responsable de mantener la confidencialidad de sus credenciales.',
            'El Usuario notificará a Cliender Tech de forma inmediata cualquier uso no autorizado de su cuenta en legal@cliender.com.',
            'Cliender Tech puede suspender o cancelar cuentas que incumplan estos Términos, previa notificación salvo urgencia por seguridad.',
            'Los usuarios menores de 18 años no pueden registrarse sin consentimiento del tutor legal.',
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-violet-500 flex-shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Obligaciones del usuario */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Obligaciones del usuario</h2>
        <p className="text-slate-600 mb-3">El Usuario se compromete a:</p>
        <ul className="space-y-2 text-slate-700 text-sm mb-4">
          {[
            'Utilizar IURALEX conforme a la legalidad vigente, la moral y el orden público.',
            'No cargar contenido ilícito, difamatorio, obsceno, o que vulnere derechos de terceros.',
            'No intentar acceder a datos de otros usuarios o despachos.',
            'No realizar ingeniería inversa, descompilar ni intentar extraer el código fuente de la plataforma.',
            'No usar la plataforma para enviar spam, malware ni contenido malicioso.',
            'No sobrecargar los sistemas mediante solicitudes automatizadas o ataques de denegación de servicio.',
            'Cumplir la normativa de protección de datos aplicable a los datos de sus clientes y partes introducidos en la plataforma.',
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-violet-500 flex-shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <strong>Responsabilidad del Despacho:</strong> El Despacho es responsable de obtener las bases jurídicas necesarias para introducir datos personales de sus clientes en IURALEX, de informarles sobre el uso de herramientas IA, y de garantizar el cumplimiento del RGPD y la LOPDGDD en el tratamiento de esos datos.
        </div>
      </section>

      {/* 5. Propiedad intelectual */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Propiedad intelectual e industrial</h2>
        <p className="text-slate-600 mb-3">
          Todos los derechos de propiedad intelectual e industrial sobre IURALEX, incluyendo su diseño, código fuente, interfaz, logotipos, marcas «IURALEX» y «Cliender Tech», y los modelos de prompts jurídicos, son titularidad exclusiva de HBD Revolution S.L. o de sus licenciantes.
        </p>
        <p className="text-slate-600 mb-3">
          Cliender Tech concede al Usuario una licencia limitada, no exclusiva, intransferible y revocable para usar IURALEX durante la vigencia del contrato y exclusivamente para sus fines internos de gestión jurídica.
        </p>
        <p className="text-slate-600">
          Los documentos, expedientes y contenidos creados por el Usuario dentro de IURALEX son propiedad del Usuario o de sus clientes. Cliender Tech no adquiere ningún derecho sobre dichos contenidos más allá de los estrictamente necesarios para prestar el servicio.
        </p>
      </section>

      {/* 6. Uso de IA */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Funciones de Inteligencia Artificial — LEXIA</h2>
        <p className="text-slate-600 mb-3">
          IURALEX incorpora el asistente jurídico LEXIA, basado en modelos de lenguaje de gran escala de Anthropic (Claude). El Usuario reconoce y acepta:
        </p>
        <div className="space-y-3">
          {[
            {
              title: 'Carácter no vinculante',
              body: 'Los análisis, resúmenes, clasificaciones y textos generados por LEXIA tienen carácter meramente orientativo. No constituyen asesoramiento jurídico, no crean relación de abogacía y no pueden sustituir el criterio profesional de un abogado colegiado.',
            },
            {
              title: 'Responsabilidad del profesional',
              body: 'El abogado o profesional que usa IURALEX es el único responsable de revisar, validar y firmar cualquier documento antes de presentarlo o entregarlo al cliente. Cliender Tech no asume responsabilidad por el uso directo de textos generados por IA sin supervisión humana.',
            },
            {
              title: 'Posibles inexactitudes',
              body: 'Los modelos de IA pueden generar información incorrecta, citas normativas inexistentes o razonamientos jurídicos erróneos («alucinaciones»). Verifique siempre las referencias legales contra las fuentes oficiales (BOE, CENDOJ, Aranzadi).',
            },
            {
              title: 'Sin entrenamiento sobre sus datos',
              body: 'Anthropic no entrena sus modelos con los datos de producción procesados a través de la API de Cliender Tech. Ver Política de Privacidad, sección 4.',
            },
          ].map(({ title, body }) => (
            <div key={title} className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="font-semibold text-slate-800 text-sm mb-1">{title}</div>
              <div className="text-sm text-slate-600">{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SLA y disponibilidad */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">7. Disponibilidad del servicio</h2>
        <p className="text-slate-600 mb-3">
          Cliender Tech se compromete a mantener IURALEX disponible con el máximo esfuerzo razonable. Durante la fase beta:
        </p>
        <ul className="space-y-2 text-slate-700 text-sm">
          {[
            'No se garantiza un porcentaje de disponibilidad SLA contractual.',
            'Se realizarán mantenimientos con notificación previa mínima de 24 horas, salvo emergencias de seguridad.',
            'Los datos del usuario serán preservados ante cualquier interrupción del servicio.',
            'Tras la fase beta se publicará un SLA formal con penalizaciones por incumplimiento.',
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-violet-500 flex-shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 8. Limitación de responsabilidad */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">8. Limitación de responsabilidad</h2>
        <p className="text-slate-600 mb-3">
          En la máxima medida permitida por la ley española aplicable:
        </p>
        <ul className="space-y-2 text-slate-700 text-sm">
          {[
            'Cliender Tech no será responsable de daños indirectos, lucro cesante, pérdida de datos o pérdida de reputación derivados del uso de IURALEX.',
            'La responsabilidad total de Cliender Tech frente al Usuario no excederá el importe pagado por el servicio en los 12 meses anteriores al hecho causante.',
            'Cliender Tech no es responsable de los contenidos introducidos por el Usuario ni de las consecuencias jurídicas de las actuaciones realizadas a partir de los análisis de LEXIA sin revisión profesional.',
            'Cliender Tech no garantiza que IURALEX sea compatible con todos los sistemas operativos, navegadores o dispositivos.',
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-violet-500 flex-shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 9. Precio y facturación */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">9. Precio, facturación y cancelación</h2>
        <ul className="space-y-2 text-slate-700 text-sm">
          {[
            'Los precios vigentes se publican en la página de precios de IURALEX y se facturan mensualmente por adelantado.',
            'Los precios no incluyen IVA, que se añade conforme a la normativa fiscal española.',
            'El Usuario puede cancelar su suscripción en cualquier momento desde su cuenta. La cancelación surte efecto al final del período facturado en curso.',
            'No se realizan reembolsos por períodos parciales, salvo incumplimiento grave de estos Términos por parte de Cliender Tech.',
            'Cliender Tech puede modificar los precios con 30 días de preaviso. La continuación en el uso tras esa fecha implica aceptación del nuevo precio.',
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-violet-500 flex-shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 10. Modificaciones */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">10. Modificación de los Términos</h2>
        <p className="text-slate-600">
          Cliender Tech puede modificar estos Términos notificándolo con al menos 30 días de antelación por correo electrónico. Si el Usuario no acepta los cambios, podrá resolver el contrato antes de su entrada en vigor sin penalización. La continuación en el uso implica aceptación.
        </p>
      </section>

      {/* 11. Ley aplicable y jurisdicción */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">11. Ley aplicable y jurisdicción</h2>
        <p className="text-slate-600 mb-3">
          Estos Términos se rigen por la legislación española. Las partes se someten expresamente a la jurisdicción de los Juzgados y Tribunales de <strong>Valencia (España)</strong>, con renuncia a cualquier otro fuero que pudiera corresponderles, salvo que la ley aplicable atribuya fuero exclusivo al Usuario como consumidor.
        </p>
        <p className="text-slate-600 text-sm">
          Normativa aplicable principal: Código Civil (CC), Código de Comercio (CCom), Ley 34/2002 LSSI-CE, Real Decreto Legislativo 1/2007 TRLGDCU, Reglamento (UE) 2016/679 RGPD, Ley Orgánica 3/2018 LOPDGDD, Ley 59/2003 de Firma Electrónica, Reglamento (UE) 2024/1689 AI Act.
        </p>
      </section>

      {/* 12. Contacto */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">12. Contacto</h2>
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
          <p className="mb-1"><strong>HBD Revolution S.L. — Departamento Legal</strong></p>
          <p className="mb-1">C/ [Calle], [Número], 46500 Sagunto, Valencia</p>
          <p><a href="mailto:legal@cliender.com" className="text-violet-600 underline">legal@cliender.com</a></p>
        </div>
      </section>
    </article>
  )
}
