# IURALEX — BRIEF DEMO ABOGADOS

**Producto**: CRM Legal con IA para despachos españoles · by **Cliender Tech**
**Stack**: Claude Haiku 4.5 + Next.js 16 + Supabase RGPD UE
**Estado**: producción demo · http://localhost:3002

---

## 1. PROPUESTA DE VALOR (30s)

> *"El primer CRM legal donde la IA hace el trabajo administrativo del despacho. No otro Aranzadi. No otro Sage. Es Cliender Tech aplicado al sector jurídico — 40% menos tiempo en gestión, 100% en derecho español."*

**Diferencia vs vLex / Iberley / Aranzadi**: ellos son consulta. Nosotros **ejecutamos**: analizamos docs, generamos escritos, calculamos plazos, asistimos a tus abogados.

---

## 2. LO QUE SÍ O SÍ HAY QUE MOSTRAR (por orden)

| # | Pantalla | Tiempo | Por qué |
|---|----------|--------|---------|
| 1 | **Login premium** | 15s | Brand Cliender = diferenciador. "by Cliender Tech" tatuado en cada pantalla |
| 2 | **Dashboard** (10/15/8/6 stats reales) | 20s | NO es vaporware. Datos reales de despacho funcionando |
| 3 | **LEXIA chat live** — pregunta sobre plazo despido | 60s | **WOW MOMENT #1.** Stream tokens en vivo. Cita exacta art. 59.3 ET |
| 4 | **Análisis IA documento** (entrar a un PDF subido) | 30s | **WOW MOMENT #2.** Detecta cláusulas ALTO/MEDIO/BAJO riesgo automáticamente |
| 5 | **Acciones** → click "Demanda por despido" | 40s | Form pre-rellenado · "Generar con LEXIA" → escrito completo en 8s |
| 6 | **Plantillas** + "Crear plantilla" wizard | 25s | Personalización: cada despacho crea las suyas |
| 7 | **Plazos procesales España** (41 plazos LEC/LECrim/LRJS) | 25s | Calculadora real con festivos nacionales 2026 |
| 8 | **Ficha cliente** + "Chat con LEXIA sobre este cliente" | 30s | **WOW MOMENT #3.** LEXIA conoce TODO del cliente: casos, docs, análisis |
| 9 | **Settings → Conexiones** (LexNET, Signaturit, vLex, AEAT, Google) | 15s | Integraciones reales del sector, no inventadas |
| 10 | **Equipo + ficha trabajador** | 15s | Gestión interna del despacho |

**Total tour**: ~5 minutos. Resto = Q&A + cierre.

---

## 3. CÓMO MOSTRAR CADA PARTE

### LEXIA (lo crítico)
- Escribir pregunta REAL del cliente delante de él (*"¿plazo para impugnar despido?"*)
- Dejar que el stream se vea en vivo (no preparado)
- Señalar las citas normativas exactas (art. X Ley Y)
- "Responde en 1-2s, sin emojis, conciso, citas verificables"

### Acciones → modal central
- Click una acción → mostrar que es **modal centrado** elegante (no slide-in)
- Rellenar el form mientras hablas con el cliente
- "Generar con LEXIA" → stream del documento jurídico completo
- "Guardar como documento" → aparece en /documents

### Plazos procesales
- 41 plazos REALES con artículo exacto (LEC art. 458, LECrim art. 463...)
- Date picker → calcula fecha límite **excluyendo festivos nacionales 2026**
- Botón "Añadir a calendario" → .ics descargable

---

## 4. POR QUÉ FUNCIONA (argumentos de cierre)

| Objection | Respuesta |
|-----------|-----------|
| "Mis abogados no van a usar AI" | "LEXIA no reemplaza al abogado. Le ahorra 4h/día de redacción mecánica" |
| "¿Y si Claude inventa una sentencia?" | "Disclaimer en cada respuesta + grounding obligatorio en BOE/CENDOJ" |
| "Ya tengo Sage/Holded" | "Esto se INTEGRA. No reemplaza facturación, reemplaza el word + carpetas" |
| "¿Cuánto cuesta?" | "Lo hablamos al final. Primero confírmame que esto te ahorra X horas/semana" |
| "RGPD?" | "Servidores UE, RLS multi-tenant, audit logs inmutables, cifrado at-rest" |

---

## 5. 3 FRASES ASESINAS PARA ABRIR

1. *"Esto NO es otro CRM. Es el primer CRM legal pensado para que la IA haga la mitad del trabajo administrativo del despacho — construido en Cliender Tech."*
2. *"No vendemos software. Vendemos las horas de tu vida que ahora mismo se te van en gestionar en vez de litigar."*
3. *"En los próximos 12 minutos verás 5 cosas que harán a tu becario obsoleto en lo administrativo — y a tus abogados senior, el doble de rentables."*

---

## 6. CHECKLIST PRE-DEMO (T-30 min)

- [ ] Container `iuralex` Up: `docker ps | grep iuralex`
- [ ] Login funciona en navegador limpio
- [ ] LEXIA responde test: "Hola, ¿estás operativa?"
- [ ] Dashboard muestra 10/15/8/6
- [ ] Audio/video Zoom-Meet/Teams testado
- [ ] Pantalla compartida modo presentación
- [ ] Video apertura listo en escritorio
- [ ] Backup plan: si LEXIA falla → captura de pantalla guardada

---

## 7. PRICING (NO DAR PRECIO HASTA QUE PIDA)

Cuando pregunte, responder:
> *"Modelo SaaS por usuario/mes. Tier de entrada €99/mes/abogado. Despacho 5 abogados = €495/mes. Set-up y onboarding sin coste primer mes. ¿Cuántos abogados activos tendrías usando esto?"*

---

**Contacto técnico**: Nicolas (Nico — Head of Systems Cliender · nicolas@cliender.com)
**Account Manager**: Ethan Luque (ethan@cliender.com)
**Soporte demo en vivo**: WhatsApp Nicolas durante la videollamada

🇪🇸 Hecho en España · HBD Revolution SL · Sagunto, Valencia
