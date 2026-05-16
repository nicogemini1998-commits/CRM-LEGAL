import { NextResponse } from 'next/server'

// Error genérico que nunca filtra detalles internos al cliente
const GENERIC_SERVER_ERROR = 'Error interno del servidor'

/**
 * Wrapper seguro para respuestas de error en API routes.
 * - En producción: nunca filtra stack traces ni mensajes internos
 * - Solo expone errores de validación/negocio explícitamente marcados como seguros
 */
export function apiError(
  error: unknown,
  status = 500,
  publicMessage?: string
): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'

  // Loguear el error real en servidor (nunca al cliente)
  if (status >= 500) {
    console.error('[API Error]', error instanceof Error ? error.message : error)
  }

  // En producción: mensaje genérico para 5xx, mensaje público para 4xx
  const message = isProd && status >= 500
    ? GENERIC_SERVER_ERROR
    : publicMessage || (error instanceof Error ? error.message : GENERIC_SERVER_ERROR)

  return NextResponse.json({ error: message }, { status })
}

/**
 * Errores de validación conocidos que es seguro exponer al cliente.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'No autorizado') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Handler centralizado para API routes — convierte errores en respuestas seguras.
 */
export async function withErrorHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler()
  } catch (err) {
    if (err instanceof ValidationError) return apiError(err, 400, err.message)
    if (err instanceof NotFoundError) return apiError(err, 404, err.message)
    if (err instanceof UnauthorizedError) return apiError(err, 401, err.message)
    return apiError(err, 500)
  }
}
