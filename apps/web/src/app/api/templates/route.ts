/**
 * /api/templates
 *
 * GET    — Lista user templates (en demo mode las plantillas "sistema" están hardcodeadas en /plantillas)
 * POST   — Crea una user template (en demo mode persiste en memoria — USER_TEMPLATES)
 * DELETE — Borra una user template por id (?id=...)
 *
 * En producción debería persistir en Supabase (TODO: tabla user_templates).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import { USER_TEMPLATES, type UserTemplate } from '@/lib/dev/demo-data'

const FieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'textarea', 'select', 'date', 'number']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
})

const CreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.string().min(1),
  emoji: z.string().optional(),
  fields: z.array(FieldSchema).min(1),
  prompt: z.string().min(10),
})

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || `tpl-${Date.now()}`
}

export async function GET() {
  const session = await auth().catch(() => null)
  const userId = session?.user?.id ?? null

  const userTemplates = USER_TEMPLATES.filter(t => !userId || t.user_id === userId || t.user_id === null)

  return NextResponse.json({
    user_templates: userTemplates,
    count: { user: userTemplates.length },
  })
}

export async function POST(req: NextRequest) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let parsed
  try {
    parsed = CreateSchema.parse(await req.json())
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Datos inválidos'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const id = `user_${slugify(parsed.title)}_${Date.now().toString(36)}`
  const tpl: UserTemplate = {
    id,
    user_id: session.user.id,
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    emoji: parsed.emoji ?? '📄',
    fields: parsed.fields,
    prompt: parsed.prompt,
    created_at: new Date().toISOString(),
  }

  USER_TEMPLATES.push(tpl)
  return NextResponse.json({ template: tpl }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const idx = USER_TEMPLATES.findIndex(t => t.id === id && (t.user_id === session.user!.id || t.user_id === null))
  if (idx === -1) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  USER_TEMPLATES.splice(idx, 1)
  return NextResponse.json({ ok: true })
}
