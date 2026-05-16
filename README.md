# IURALEX — CRM Legal con IA para Despachos Españoles

> **"La IA que entiende el derecho español."**  
> Plataforma SaaS premium para despachos de abogados: gestión de expedientes, análisis documental con Claude AI, generación de contratos y asistente jurídico conversacional.

![Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Claude](https://img.shields.io/badge/Claude-Haiku_4.5-orange) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)

---

## ¿Qué es IURALEX?

IURALEX es un CRM Legal inteligente diseñado para el mercado español. Combina la gestión operativa de un despacho (expedientes, clientes, documentos) con inteligencia artificial de última generación (Claude AI de Anthropic) para automatizar las tareas más repetitivas del trabajo jurídico.

### Para qué tipo de abogado está diseñado

| Perfil | Qué obtiene |
|--------|-------------|
| **Penalista** | Escritos de defensa, querellas, recursos de apelación en minutos |
| **Laboralista** | Demandas por despido, cartas, análisis de contratos |
| **Civilista** | Reclamaciones de cantidad, procesos monitorios |
| **Familiarista** | Demandas de divorcio, convenios reguladores |
| **Mercantilista** | Estatutos de SL, pactos de socios, poderes |
| **Administrativista** | Recursos de alzada, contencioso-administrativo |
| **Inmobiliario** | Desahucios, contratos de arrendamiento, arras |

---

## Funcionalidades principales

### 🗂️ Gestión de Expedientes
- CRUD completo de casos con número, estado y cliente asociado
- Timeline de eventos por caso
- Vinculación de documentos y análisis IA al expediente

### 👥 CRM de Clientes
- Ficha completa: nombre, NIF/CIF, contacto, tipo (persona/empresa)
- Historial de casos por cliente

### 📄 Documentos con IA
- Upload de PDF, DOCX y TXT (hasta 25 MB)
- Conversión automática a Markdown para análisis óptimo
- **SkillPanel**: 20 acciones jurídicas ejecutadas por LEXIA en streaming

### ⚡ Centro de Acciones (20 skills)
Acciones jurídicas más frecuentes organizadas por área:

| Área | Acciones disponibles |
|------|---------------------|
| Penal | Escrito de defensa · Querella · Recurso de apelación |
| Familia | Demanda de divorcio · Convenio regulador |
| Laboral | Demanda por despido · Carta de despido · Revisión contrato |
| Civil | Reclamación de cantidad · Proceso monitorio |
| Contratos | Revisar contrato · NDA · Redactar contrato |
| Administrativo | Recurso de alzada · Recurso contencioso |
| Inmobiliario | Demanda desahucio · Contrato arrendamiento |

### 📋 Biblioteca de Plantillas (20 plantillas)
Documentos jurídicos listos para generar con datos del cliente. Panel lateral con formulario → genera con LEXIA en segundos.

### ⏱️ Calculadora de Plazos
- 24 tipos de plazos procesales (LEC, LECrim, LRJS, LPAC, LSC)
- Cálculo de días hábiles (excluye festivos nacionales españoles)
- Alerta visual si el plazo está vencido

### 💬 LEXIA — Asistente Jurídico
- Chat conversacional especializado en derecho español
- Historial con sidebar collapsible (`Cmd+\`)
- Streaming en tiempo real con prompt caching (90% ahorro tokens)

### ⚙️ Settings y Conexiones
- 10 integraciones: Google Drive, Dropbox, OneDrive, Signaturit, LexNET…
- Seguridad: 2FA, sesiones activas, audit log RGPD
- Configuración del modelo IA, disclaimers, caché

---

## Stack técnico

```
Frontend:    Next.js 15 (App Router) + TypeScript + Tailwind CSS
Animaciones: Framer Motion
Backend:     Next.js API Routes (SSE streaming)
Base datos:  Supabase (PostgreSQL + Storage + RLS)
Auth:        NextAuth.js v4 con JWT HttpOnly cookies
IA:          Claude Haiku 4.5 (Anthropic) — prompt caching activo
Skills:      claude-for-legal (13 plugins, 60+ skills)
Deploy:      Vercel
Monorepo:    Turborepo + pnpm workspaces
```

---

## Estructura del proyecto

```
/
├── apps/
│   └── web/                        # Next.js 15 app
│       └── src/
│           ├── app/
│           │   ├── (auth)/          # Login · Registro
│           │   ├── (dashboard)/
│           │   │   ├── acciones/    # Hub 20 acciones jurídicas IA
│           │   │   ├── cases/       # Gestión expedientes
│           │   │   ├── chat/        # LEXIA asistente conversacional
│           │   │   ├── clients/     # CRM clientes
│           │   │   ├── documents/   # Documentos + SkillPanel
│           │   │   ├── generate/    # Generador de contratos
│           │   │   ├── plantillas/  # 20 plantillas jurídicas
│           │   │   ├── plazos/      # Calculadora plazos procesales
│           │   │   └── settings/    # Configuración + conexiones
│           │   └── api/
│           │       ├── claude/      # analyze · chat · generate (SSE)
│           │       ├── skills/      # execute · list
│           │       ├── documents/   # CRUD + parse PDF/DOCX
│           │       ├── cases/       # CRUD expedientes
│           │       └── clients/     # CRUD clientes
│           ├── components/
│           │   ├── features/
│           │   │   ├── skill-panel/      # Upload + selector + streaming
│           │   │   └── command-palette/  # Cmd+K búsqueda global
│           │   └── ui/               # Design system IURALEX
│           └── lib/
│               ├── legal-skills.ts         # 80+ skills registry (client-safe)
│               ├── legal-skills-server.ts  # File loaders (server-only)
│               ├── document-parser.ts      # PDF/DOCX/TXT → Markdown
│               └── auth/ · security/
│
├── packages/
│   └── claude-for-legal/           # Plugins IA de Anthropic (13 plugins)
│
└── supabase/
    ├── migrations/                  # Schema SQL + RLS policies
    └── seed.sql                     # Admin + 5 templates
```

---

## Instalación

### Prerrequisitos
- Node.js 20+, pnpm 9+
- Cuenta [Supabase](https://supabase.com) + cuenta [Anthropic](https://console.anthropic.com)

### 1. Clonar e instalar
```bash
git clone https://github.com/cliender/CRM-LEGAL.git
cd CRM-LEGAL
pnpm install
```

### 2. Variables de entorno
Crea `apps/web/.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-...

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

NEXTAUTH_SECRET=minimo-32-caracteres-random
NEXTAUTH_URL=http://localhost:3000
```

### 3. Base de datos (Supabase SQL Editor)
```sql
-- Ejecutar en orden:
-- 1. supabase/migrations/001_init_schema.sql
-- 2. supabase/migrations/002_rls_policies.sql
-- 3. supabase/migrations/003_generated_contracts_and_storage.sql
-- 4. supabase/seed.sql
```

### 4. Storage
Supabase → Storage → New bucket → `legal-documents` (privado)

### 5. Arrancar
```bash
pnpm --filter web dev
# → http://localhost:3000
```

**Usuario admin**: `nicolas@cliender.com` / `Master123`

---

## Deploy en Vercel

1. Importa el repo desde [vercel.com](https://vercel.com)
2. Root directory: `apps/web`
3. Añade las variables de entorno
4. Deploy

---

## Seguridad

| Capa | Implementación |
|------|---------------|
| Auth | JWT HttpOnly cookies · NextAuth v4 |
| DB | RLS en todas las tablas · Supabase |
| Input | Zod validation · XSS/SQLi sanitización |
| API | Rate limiting 20 req/min Claude · 100 general |
| Privacidad | RGPD Art. 17/20/30 · soft-delete · audit logs |
| Headers | HSTS · CSP · X-Frame-Options · CORS |

---

## Estimación de costes API

| Operación | Coste |
|-----------|-------|
| Análisis documento (1ª vez) | ~0.003 € |
| Análisis documento (caché) | ~0 € |
| Generar contrato | ~0.004 € |
| Mensaje de chat | ~0.001 € |
| **100 ops/mes por despacho** | **< 0.50 €/mes** |

---

## Pricing

| Plan | Precio | Usuarios |
|------|--------|----------|
| Boutique | 59 €/mes | 1 |
| Despacho | 49 €/mes/usuario | Mín. 3 |
| Enterprise | 39 €/mes/usuario + setup 500 € | Mín. 10 |

---

## Roadmap

- [ ] Integración LexNET (Ministerio de Justicia)
- [ ] Firma electrónica con Signaturit
- [ ] Alertas BOE por área de práctica
- [ ] App móvil (React Native + Expo)
- [ ] Multi-tenant (organizations + billing)
- [ ] WhatsApp Business API para comunicación con clientes
- [ ] Búsqueda semántica con embeddings

---

## Licencia

Propietario — © 2026 [Cliender](https://cliender.com). Todos los derechos reservados.

---

*Desarrollado por Nicolas · [Cliender](https://cliender.com) · Madrid, España*
