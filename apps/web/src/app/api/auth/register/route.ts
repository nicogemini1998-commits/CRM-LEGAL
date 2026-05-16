import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sanitizeEmail, sanitizeText } from '@/lib/security/sanitize'
import { withErrorHandler, ValidationError } from '@/lib/security/apiResponse'
import { auditLog } from '@/lib/security/gdpr'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const { email: rawEmail, password, fullName: rawName } = await request.json()

    // Sanitize and validate all inputs server-side
    const email = sanitizeEmail(rawEmail)
    const fullName = sanitizeText(rawName)

    if (!email) throw new ValidationError('Email inválido')
    if (!fullName || fullName.length < 2) throw new ValidationError('Nombre inválido (mínimo 2 caracteres)')
    if (fullName.length > 255) throw new ValidationError('Nombre demasiado largo')
    if (!password || typeof password !== 'string') throw new ValidationError('Contraseña requerida')
    if (password.length < 8) throw new ValidationError('La contraseña debe tener al menos 8 caracteres')
    if (password.length > 128) throw new ValidationError('Contraseña demasiado larga')

    // Hash password server-side with sufficient cost factor
    const passwordHash = await bcrypt.hash(password, 12)

    const supabase = createServerClient()

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    // Don't reveal whether email exists — uniform error prevents user enumeration
    if (existingUser) {
      throw new ValidationError('No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo.')
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash, role: 'lawyer' })
      .select()
      .single()

    if (userError) throw new Error(userError.message)

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        full_name: fullName,
        gdpr_consent: true,
        gdpr_consent_date: new Date().toISOString(),
      })

    if (profileError) {
      await supabase.from('users').delete().eq('id', user.id)
      throw new Error(profileError.message)
    }

    await auditLog({
      userId: user.id,
      action: 'REGISTER',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email } },
      { status: 201 }
    )
  })
}
