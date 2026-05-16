// RGPD/LOPD Compliance — Ley Orgánica 3/2018 + Reglamento UE 2016/679
import { createServerClient } from '@/lib/supabase/server'

export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'DELETE_ACCOUNT'
  | 'UPLOAD_DOCUMENT' | 'DELETE_DOCUMENT' | 'ANALYZE_DOCUMENT'
  | 'GENERATE_CONTRACT' | 'CHAT_MESSAGE'
  | 'CREATE_CASE' | 'DELETE_CASE'
  | 'CREATE_CLIENT' | 'DELETE_CLIENT'
  | 'EXPORT_DATA' | 'VIEW_DOCUMENT'

/**
 * Registra una acción en el log de auditoría.
 * Requerido por RGPD Art. 30 (registro de actividades de tratamiento).
 * Nunca lanza — un fallo en auditoría no debe bloquear la operación principal.
 */
export async function auditLog(params: {
  userId: string
  action: AuditAction
  resourceType?: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    const supabase = createServerClient()
    await supabase.from('audit_logs').insert({
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      ip_address: params.ipAddress ? anonymizeIP(params.ipAddress) : null,
      user_agent: params.userAgent?.slice(0, 500),
      new_values: params.metadata || null,
    })
  } catch (err) {
    console.error('[Audit Log Error]', err)
  }
}

/**
 * Anonimiza una IP para cumplir RGPD (Art. 4 — datos personales).
 * IPv4: elimina último octeto. IPv6: elimina últimos 4 grupos.
 */
function anonymizeIP(ip: string): string {
  if (ip.includes(':')) {
    // IPv6
    const parts = ip.split(':')
    return [...parts.slice(0, 4), '0000', '0000', '0000', '0000'].join(':')
  }
  // IPv4
  const parts = ip.split('.')
  return [...parts.slice(0, 3), '0'].join('.')
}

/**
 * Exporta todos los datos de un usuario (RGPD Art. 20 — portabilidad).
 */
export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  const supabase = createServerClient()

  const [profile, cases, documents, clients, chats, contracts] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('cases').select('*').eq('user_id', userId),
    supabase.from('documents').select('id, title, document_type, created_at').eq('user_id', userId).is('deleted_at', null),
    supabase.from('clients').select('*').eq('user_id', userId),
    supabase.from('chat_conversations').select('*, chat_messages(*)').eq('user_id', userId),
    supabase.from('generated_contracts').select('contract_type, created_at, tokens_used').eq('user_id', userId),
  ])

  return {
    exported_at: new Date().toISOString(),
    gdpr_notice: 'Datos exportados conforme a RGPD Art. 20 — Derecho de portabilidad',
    profile: profile.data,
    cases: cases.data,
    documents: documents.data,
    clients: clients.data,
    conversations: chats.data,
    generated_contracts: contracts.data,
  }
}

/**
 * Elimina todos los datos de un usuario (RGPD Art. 17 — derecho al olvido).
 * Soft delete con 30 días de retención mínima por obligaciones legales.
 */
export async function deleteUserData(userId: string): Promise<void> {
  const supabase = createServerClient()
  const deletedAt = new Date().toISOString()

  // Soft delete de documentos
  await supabase.from('documents')
    .update({ deleted_at: deletedAt, content: null })
    .eq('user_id', userId)

  // Anonimizar mensajes de chat
  await supabase.from('chat_messages')
    .update({ content: '[Contenido eliminado - RGPD Art. 17]' })
    .in('conversation_id',
      (await supabase.from('chat_conversations').select('id').eq('user_id', userId)).data?.map(c => c.id) || []
    )

  // Anonimizar perfil (no eliminar — necesario para audit trail)
  await supabase.from('user_profiles')
    .update({
      full_name: '[Eliminado]',
      organization: null,
      phone: null,
    })
    .eq('id', userId)

  await auditLog({ userId, action: 'DELETE_ACCOUNT', metadata: { reason: 'RGPD Art. 17' } })
}

/**
 * Retención de datos: elimina registros antiguos conforme a política RGPD.
 * Ejecutar como cron job mensual.
 */
export async function enforceDataRetention(): Promise<void> {
  const supabase = createServerClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Hard delete de documentos en soft-delete > 30 días
  await supabase.from('documents')
    .delete()
    .lt('deleted_at', thirtyDaysAgo)
    .not('deleted_at', 'is', null)

  // Limpiar audit logs > 2 años (retención mínima legal)
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
  await supabase.from('audit_logs').delete().lt('created_at', twoYearsAgo)
}
