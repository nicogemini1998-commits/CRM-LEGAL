/**
 * /api/templates/[id]
 *
 * GET    — Obtiene una user template por id
 * PUT    — Actualiza una user template por id
 * DELETE — Elimina una user template por id
 *
 * En producción debería persistir en Supabase (TODO: tabla user_templates).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import { USER_TEMPLATES, updateUserTemplate, deleteUserTemplate } from '@/lib/dev/demo-data'

const FieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'textarea', 'select', 'date', 'number']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
})

const UpdateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.string().min(1),
  emoji: z.string().optional(),
  fields: z.array(FieldSchema).min(1),
  prompt: z.string().min(10),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth().catch(() => null)
  const userId = session?.user?.id ?? null

  const tpl = USER_TEMPLATES.find(
    t => t.id === params.id && (!userId || t.user_id === userId || t.user_id === null)
  )
  if (!tpl) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  return NextResponse.json({ template: tpl })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let parsed
  try {
    parsed = UpdateSchema.parse(await req.json())
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Datos inválidos'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const ok = updateUserTemplate(params.id, session.user.id, {
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    emoji: parsed.emoji ?? '📄',
    fields: parsed.fields,
    prompt: parsed.prompt,
  })

  if (!ok) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  const updated = USER_TEMPLATES.find(t => t.id === params.id)
  return NextResponse.json({ template: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ok = deleteUserTemplate(params.id, session.user.id)
  if (!ok) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
