# LEXIA OS

Asistente jurídico premium para despachos de abogados españoles. SaaS con gestión de expedientes, análisis documental con Claude AI, generación inteligente de contratos, CRM legal y automatización.

## Setup

### 1. Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Necesitas:
- **Supabase**: Crea un proyecto en [supabase.com](https://supabase.com)
  - Obtén: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Copia las 3 claves a `.env.local`

- **Claude API**: Obtén key de [console.anthropic.com](https://console.anthropic.com)
  - `ANTHROPIC_API_KEY`

- **NextAuth Secret**: Genera con:
  ```bash
  openssl rand -base64 32
  ```
  - `NEXTAUTH_SECRET`

### 2. Base de datos

```bash
cd apps/web

# Run migrations (después de configurar Supabase)
pnpm dlx supabase@latest db push --local
```

O ejecuta manualmente las migrations en Supabase SQL Editor:
- `supabase/migrations/001_init_schema.sql`
- `supabase/migrations/002_rls_policies.sql`

### 3. Install & Run

```bash
cd apps/web

# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

Accede a http://localhost:3000

## Project Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── (dashboard)/  # Protected routes
│   │   └── api/          # API routes
│   ├── lib/
│   │   ├── auth/         # NextAuth configuration
│   │   ├── claude/       # Claude AI integration
│   │   ├── supabase/     # Supabase clients
│   │   └── schemas.ts    # Zod validation
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── types/            # TypeScript types
└── supabase/
    └── migrations/       # Database migrations
```

## Features (Fase 1)

- ✅ Autenticación segura (NextAuth + JWT)
- ✅ Gestión de usuarios
- ✅ Row Level Security en base de datos
- 🚧 Dashboard básico
- 🚧 Gestión de casos (próximas)
- 🚧 Upload de documentos (próximas)
- 🚧 Análisis con Claude AI (próximas)
- 🚧 Generación de contratos (próximas)
- 🚧 Chat jurídico (próximas)

## Development Roadmap

**Semana 1** (✅ Done): Setup + Auth + DB Schema
**Semana 2**: UI Base + Document Upload + Basic Claude Analysis
**Semana 3**: Streaming + Contract Generation
**Semana 4**: Case Management + Clients + Legal Chat
**Semana 5-6**: Polish + Testing + Deployment

## Security & Compliance

- ✅ HTTPS + Security headers
- ✅ RLS (Row Level Security) en todas las tablas
- ✅ GDPR consent en registro
- ✅ Audit logging
- ✅ Input validation (Zod)
- ✅ Rate limiting ready (Upstash)
- 🚧 Encryption para docs confidenciales

## Environment Variables

Ver `.env.example`

## Deployment

### Vercel

```bash
git push origin main
# Vercel auto-deploys
```

Configura variables de entorno en Vercel project settings.

### Custom Hosting

```bash
pnpm run build
pnpm start
```

## Support

- Documentación técnica: `docs/`
- Plan de implementación: `.claude/plans/`
- Prompts de Claude: `src/lib/claude/prompts.ts`

---

**Status**: Alpha (Fase 1 en progreso)
**Stack**: Next.js 15 + TypeScript + Tailwind + Supabase + Claude API
