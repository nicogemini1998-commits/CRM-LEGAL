import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcrypt'

// Ruta protegida: solo funciona con SEED_SECRET correcto
// Uso: POST /api/admin/seed con header Authorization: Bearer <SEED_SECRET>
// Solo disponible si SEED_SECRET está definido en .env
export async function POST(req: NextRequest) {
  const secret = process.env.SEED_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Seed deshabilitado' }, { status: 403 })
  }

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createServerClient()

  // Crear usuario admin Nicolas
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'nicolas@cliender.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!adminPassword || adminPassword.length < 12) {
    return NextResponse.json({ error: 'SEED_ADMIN_PASSWORD required (min 12 chars)' }, { status: 500 })
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', adminEmail)
    .single()

  let userId: string

  if (existingUser) {
    // Actualizar hash de contraseña si ya existe
    await supabase
      .from('users')
      .update({ password_hash: passwordHash, role: 'admin' })
      .eq('email', adminEmail)
    userId = existingUser.id
  } else {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: adminEmail,
        password_hash: passwordHash,
        role: 'admin',
      })
      .select()
      .single()

    if (error || !newUser) {
      return NextResponse.json({ error: 'Error al crear usuario: ' + error?.message }, { status: 500 })
    }
    userId = newUser.id

    await supabase.from('user_profiles').upsert({
      id: userId,
      full_name: 'Nicolas — Cliender',
      organization: 'Cliender',
      gdpr_consent: true,
      gdpr_consent_date: new Date().toISOString(),
    })
  }

  // Insertar templates de contratos
  const templates = [
    {
      name: 'NDA - Acuerdo de Confidencialidad',
      description: 'Acuerdo de no divulgación bilateral para proteger información confidencial.',
      prompt_template: 'Genera un NDA completo conforme a la Ley de Secretos Empresariales 1/2019. Partes: {{parte_reveladora}} y {{parte_receptora}}. Objeto: {{objeto_confidencial}}. Duración: {{duracion}} años.',
      fields: JSON.stringify([
        { name: 'parte_reveladora', label: 'Parte que revela información', type: 'text', required: true },
        { name: 'parte_receptora', label: 'Parte que recibe información', type: 'text', required: true },
        { name: 'objeto_confidencial', label: 'Información confidencial', type: 'textarea', required: true },
        { name: 'duracion', label: 'Duración (años)', type: 'number', required: true, default: '3' },
      ]),
      category: 'Confidencialidad',
    },
    {
      name: 'Contrato de Compraventa',
      description: 'Compraventa de bienes muebles o inmuebles conforme al Código Civil.',
      prompt_template: 'Genera contrato de compraventa (CC art. 1.445). Vendedor: {{vendedor}} NIF {{nif_vendedor}}. Comprador: {{comprador}} NIF {{nif_comprador}}. Bien: {{descripcion_bien}}. Precio: {{precio}}€. Pago: {{forma_pago}}.',
      fields: JSON.stringify([
        { name: 'vendedor', label: 'Nombre del vendedor', type: 'text', required: true },
        { name: 'nif_vendedor', label: 'NIF del vendedor', type: 'text', required: true },
        { name: 'comprador', label: 'Nombre del comprador', type: 'text', required: true },
        { name: 'nif_comprador', label: 'NIF del comprador', type: 'text', required: true },
        { name: 'descripcion_bien', label: 'Descripción del bien', type: 'textarea', required: true },
        { name: 'precio', label: 'Precio (€)', type: 'number', required: true },
        { name: 'forma_pago', label: 'Forma de pago', type: 'text', required: true },
      ]),
      category: 'Civil / Mercantil',
    },
    {
      name: 'Contrato de Arrendamiento',
      description: 'Arrendamiento de vivienda o local conforme a la LAU.',
      prompt_template: 'Genera contrato arrendamiento (LAU 29/1994). Arrendador: {{arrendador}}. Arrendatario: {{arrendatario}}. Inmueble: {{descripcion_inmueble}}. Renta: {{renta}}€/mes. Duración: {{duracion}} años. Tipo: {{tipo_arrendamiento}}.',
      fields: JSON.stringify([
        { name: 'arrendador', label: 'Arrendador', type: 'text', required: true },
        { name: 'arrendatario', label: 'Arrendatario', type: 'text', required: true },
        { name: 'descripcion_inmueble', label: 'Inmueble', type: 'textarea', required: true },
        { name: 'renta', label: 'Renta mensual (€)', type: 'number', required: true },
        { name: 'duracion', label: 'Duración (años)', type: 'number', required: true, default: '1' },
        { name: 'tipo_arrendamiento', label: 'Tipo', type: 'text', required: true, default: 'Vivienda habitual' },
      ]),
      category: 'Arrendamientos',
    },
    {
      name: 'Contrato de Préstamo',
      description: 'Préstamo entre particulares conforme al Código Civil.',
      prompt_template: 'Genera contrato de préstamo (CC art. 1.740). Prestamista: {{prestamista}}. Prestatario: {{prestatario}}. Capital: {{capital}}€. Interés: {{interes}}% anual. Plazo: {{plazo}} meses.',
      fields: JSON.stringify([
        { name: 'prestamista', label: 'Prestamista', type: 'text', required: true },
        { name: 'prestatario', label: 'Prestatario', type: 'text', required: true },
        { name: 'capital', label: 'Capital (€)', type: 'number', required: true },
        { name: 'interes', label: 'Interés anual (%)', type: 'number', required: true, default: '0' },
        { name: 'plazo', label: 'Plazo (meses)', type: 'number', required: true },
      ]),
      category: 'Civil / Mercantil',
    },
    {
      name: 'Prestación de Servicios',
      description: 'Servicios profesionales entre autónomos/empresas.',
      prompt_template: 'Genera contrato de servicios (LETA 20/2007). Prestador: {{prestador}} NIF {{nif_prestador}}. Cliente: {{cliente}} NIF {{nif_cliente}}. Servicios: {{descripcion_servicios}}. Honorarios: {{honorarios}}€ {{periodicidad_honorarios}}.',
      fields: JSON.stringify([
        { name: 'prestador', label: 'Prestador de servicios', type: 'text', required: true },
        { name: 'nif_prestador', label: 'NIF del prestador', type: 'text', required: true },
        { name: 'cliente', label: 'Cliente', type: 'text', required: true },
        { name: 'nif_cliente', label: 'NIF del cliente', type: 'text', required: true },
        { name: 'descripcion_servicios', label: 'Descripción servicios', type: 'textarea', required: true },
        { name: 'honorarios', label: 'Honorarios (€)', type: 'number', required: true },
        { name: 'periodicidad_honorarios', label: 'Periodicidad', type: 'text', required: true, default: 'mensuales' },
      ]),
      category: 'Servicios',
    },
  ]

  for (const template of templates) {
    await supabase.from('contract_templates').upsert(template, { onConflict: 'name' })
  }

  return NextResponse.json({
    success: true,
    message: 'IURALEX inicializado correctamente',
    admin: { email: adminEmail, role: 'admin' },
    templates_created: templates.length,
  })
}
