import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const RegisterSchema = LoginSchema.extend({
  fullName: z.string().min(2, 'Full name is required'),
  acceptTerms: z.boolean().refine(v => v === true, {
    message: 'You must accept the terms and conditions',
  }),
  acceptGDPR: z.boolean().refine(v => v === true, {
    message: 'You must consent to data processing',
  }),
})

export const DocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().max(1000000, 'Content is too large'),
  documentType: z.enum(['contract', 'brief', 'motion', 'other']),
  confidential: z.boolean().default(false),
})

export const CaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  caseNumber: z.string().optional(),
  status: z.enum(['open', 'closed', 'archived']).default('open'),
})

export const ClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  nifCif: z.string().optional(),
  type: z.enum(['individual', 'company']).default('individual'),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type DocumentInput = z.infer<typeof DocumentSchema>
export type CaseInput = z.infer<typeof CaseSchema>
export type ClientInput = z.infer<typeof ClientSchema>
