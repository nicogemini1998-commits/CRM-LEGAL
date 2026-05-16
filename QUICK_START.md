# LEXIA OS - Quick Start

## ✅ Semana 1 Completada

He creado la **estructura completa para MVP Fase 1** de LEXIA OS.

### Archivos Creados (22 archivos)

**Core Auth:**
- `middleware.ts` - Security headers + auth routing
- `lib/auth/auth.config.ts` - NextAuth configuration
- `lib/auth/auth.ts` - NextAuth handlers
- `app/api/auth/[...nextauth]/route.ts` - NextAuth route
- `app/api/auth/register/route.ts` - Registration endpoint

**Database:**
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/client.ts` - Browser Supabase client
- `supabase/migrations/001_init_schema.sql` - DB tables
- `supabase/migrations/002_rls_policies.sql` - RLS policies

**Frontend:**
- `app/(auth)/layout.tsx` - Auth layout
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/register/page.tsx` - Register page
- `app/(dashboard)/layout.tsx` - Dashboard layout
- `app/(dashboard)/page.tsx` - Dashboard home
- `app/layout.tsx` - Root layout with SessionProvider

**Claude AI:**
- `lib/claude/prompts.ts` - System prompts (análisis, generación, chat)
- `lib/claude/client.ts` - Claude API integration

**Validation & Types:**
- `lib/schemas.ts` - Zod validation schemas
- `types/index.ts` - TypeScript interfaces

**Config:**
- `.env.example` - Environment template
- `README.md` - Full documentation
- `QUICK_START.md` - This file

---

## 🚀 Próximos Pasos

### 1. Setup Supabase (5 minutos)

```bash
# a) Crear proyecto en https://supabase.com
# b) Obtener keys de Settings > API
# c) Copiar a .env.local

cp apps/web/.env.example apps/web/.env.local
# Editar con tus Supabase keys + Anthropic API key
```

### 2. Crear tablas (2 minutos)

En Supabase SQL Editor, ejecuta:
1. Contenido de `supabase/migrations/001_init_schema.sql`
2. Contenido de `supabase/migrations/002_rls_policies.sql`

### 3. Ejecutar Dev Server (1 minuto)

```bash
cd apps/web
pnpm install
pnpm dev
```

Abre http://localhost:3000

### 4. Testear Auth Flow

- Ir a `/register` → crear cuenta
- Login con credenciales
- Deberías ver dashboard

---

## 📋 Checklist - Semana 1

- [x] Next.js 15 initialized
- [x] NextAuth.js v5 configured
- [x] Supabase clients created
- [x] DB schema with RLS
- [x] Login/Register pages
- [x] Dashboard layout
- [x] Security headers in middleware
- [x] TypeScript types
- [x] Zod schemas
- [x] Claude prompts ready

---

## 🎯 Próximas Tareas - Semanas 2-6

**Semana 2**: UI Base + Documents + Basic Claude
- [ ] Dashboard stats cards
- [ ] Document upload (PDF, DOCX)
- [ ] Document list view
- [ ] Claude API analyze endpoint (non-streaming first)
- [ ] Display analysis result in modal

**Semana 3**: Streaming + Contract Generation
- [ ] Implement SSE streaming for analyses
- [ ] Add skeleton loading + animations
- [ ] Contract generator with templates (5 types)
- [ ] Show token usage + costs
- [ ] Save analyses to DB

**Semana 4**: Cases + Clients + Chat
- [ ] Cases CRUD
- [ ] Clients CRM
- [ ] Chat conversational (legal assistant)
- [ ] Chat history storage
- [ ] Case timeline view

**Semanas 5-6**: Polish + Tests + Deploy
- [ ] Type checking (strict mode)
- [ ] Component tests
- [ ] E2E auth tests
- [ ] Performance optimizations
- [ ] Deploy to Vercel
- [ ] Documentation finalized

---

## 💡 Arquitectura

**Monorepo**: Single Next.js app (escalable a web + mobile después)
**Auth**: NextAuth.js v5 + JWT + Supabase DB
**DB**: Supabase PostgreSQL con RLS en todas las tablas
**AI**: Claude API con prompts especializados (análisis, generación, chat)
**UI**: Shadcn/ui + Tailwind + Framer Motion (premium minimal design)

---

## 📚 Key Files to Know

| Archivo | Propósito |
|---------|-----------|
| `middleware.ts` | Security headers + auth checks |
| `lib/auth/` | NextAuth setup |
| `lib/claude/prompts.ts` | System prompts (importante!) |
| `supabase/migrations/` | DB schema |
| `app/(auth)/` | Public auth pages |
| `app/(dashboard)/` | Protected routes |
| `lib/schemas.ts` | Input validation |
| `lib/supabase/` | DB clients |

---

## ⚡ Tech Stack Confirmado

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, Supabase PostreSQL
- **Auth**: NextAuth.js v5, JWT + Cookies
- **AI**: Claude API (Haiku model)
- **Validation**: Zod
- **Security**: RLS, HTTPS, CSRF, rate limiting ready
- **Deployment**: Vercel

---

## 🔐 Security Status

- ✅ HTTPS + Security headers (HSTS, CSP, X-Frame, XSS)
- ✅ RLS policies on all tables
- ✅ GDPR consent in registration
- ✅ Input validation (Zod)
- ✅ HttpOnly cookies for JWT
- ✅ Audit logging ready
- 🚧 Encryption for confidential docs (próximas semanas)
- 🚧 Rate limiting (Upstash configured)

---

## 📞 Support

- **Plan**: Ver `.claude/plans/quiero-que-act-es-como-bubbly-wilkinson.md`
- **Architecture**: Documentado en plan
- **Code**: Limpio, typed, listo para escalar

---

## 💰 Cost Status

- **Supabase**: Free tier (suficiente para MVP)
- **Claude API**: ~$0.01 por análisis con caching
- **Vercel**: Free tier (funciona perfectamente)
- **Total MVP**: < €50/mes

---

**Status**: 🟢 Semana 1 ✅ Completada
**Próxima**: Semana 2 - UI + Documents + Claude Análisis

¡Listo para construir! 🚀
