# Checklist Pre-Demo IURALEX · 30 min antes

> Imprimir esto o tenerlo abierto en pestaña aparte. Ir tachando.

---

## INFRAESTRUCTURA · T-30 a T-20

- [ ] **Container Docker `iuralex` running**
  ```bash
  docker ps | grep iuralex
  ```
  Debe aparecer status `Up`. Si no:
  ```bash
  cd /Users/nicolasag/CRM-LEGAL && docker compose up -d
  ```

- [ ] **Health check API** responde 200
  ```bash
  curl -s http://localhost:3000/api/health
  ```

- [ ] **Base de datos poblada** (los seed scripts corrieron):
  - Dashboard muestra: **12 expedientes · 8 clientes · 15 documentos · 5 contratos**
  - Si no → `docker compose exec iuralex npm run seed:demo`

- [ ] **LEXIA responde** a pregunta de prueba. Login → cualquier expediente → abrir LEXIA → preguntar: *"Hola, ¿funcionas?"* → respuesta en <5 seg.

- [ ] **Logs en otra terminal** por si algo casca:
  ```bash
  docker compose logs -f iuralex
  ```

---

## NAVEGADOR · T-20 a T-15

- [ ] Chrome/Arc con perfil limpio (sin extensiones que estorben, sin notificaciones popup)
- [ ] Una sola pestaña abierta con IURALEX. Cerrar el resto.
- [ ] Zoom al 100% (Cmd+0). Si pantalla cliente pequeña → 110%.
- [ ] **Login YA hecho** — el cliente no debe ver login en blanco esperando
- [ ] Modo presentación / fullscreen preparado (F11 listo)
- [ ] Bookmarks ocultos, barra de favoritos OFF
- [ ] DevTools cerradas
- [ ] Modo claro del SO si el cliente es perfil tradicional

---

## AUDIO / VIDEO / COMPARTIR · T-15 a T-10

- [ ] Cámara probada en Meet/Zoom/Teams
- [ ] Micro probado — no usar micro del MacBook si hay alternativa
- [ ] Auriculares conectados (cable mejor que Bluetooth)
- [ ] **Pantalla compartida testeada** — compartir solo ventana del navegador, NO escritorio entero
- [ ] No molestar activado en macOS (luna esquina sup. derecha)
- [ ] Slack / WhatsApp Desktop / Mail cerrados o silenciados
- [ ] Batería >50% o cargador enchufado
- [ ] Wifi estable: `ping -c 5 8.8.8.8`

---

## CONTENIDO · T-10 a T-5

- [ ] `demo-script.md` abierto en pantalla secundaria o iPad
- [ ] `objection-handling.md` accesible (Cmd+Tab rápido)
- [ ] `demo-data-talking-points.md` revisado · saber qué expediente abrir
- [ ] Calendario despejado 30 min DESPUÉS (preguntas + follow-up inmediato)
- [ ] Propuesta tipo lista en borrador para enviar tras la demo
- [ ] CRM Cliender abierto para anotar en directo

---

## BACKUP PLAN · si algo falla

| Falla | Plan B |
|---|---|
| Docker no arranca | Vídeo grabado de la demo guardado en `/Users/nicolasag/CRM-LEGAL/demo/backup-recording.mp4` |
| LEXIA no responde | Saltar a Plantillas · NDA wizard (impacta igual) |
| Internet lento | Pasarse a hotspot del móvil · tenerlo configurado YA |
| Cliente no oye | Llamar por teléfono y seguir compartiendo pantalla |
| Bug visible | "Lo tenemos detectado, ignóralo" + seguir. NO disculparse 3 veces |
| Cliente quiere meterse él | "Hoy te lo enseño yo. Si avanzamos, mañana tienes tu usuario para tocar tú" |

---

## MENTAL · T-2

- [ ] Agua a mano (no café, reseca)
- [ ] Papel + boli físico para anotar (más rápido que teclear)
- [ ] Respirar 3 veces hondo
- [ ] Recordar: la demo no es para impresionar, es para entender al cliente
- [ ] **Objetivo de la llamada claro**: ¿próximo paso es propuesta? ¿trial? ¿segunda demo con su equipo?

---

## PREGUNTAS FRECUENTES · papel a mano

Tener escritas (papel, NO pantalla) las respuestas cortas a:

1. ¿Cuánto cuesta? → "Por nº de abogados, te paso propuesta en 24h"
2. ¿Está la pasta segura? → "Servidores UE, RGPD, cifrado en reposo"
3. ¿LexNET integrado? → "En piloto, Q3"
4. ¿Y si la IA inventa? → "Grounded a TUS docs, siempre cita fuente"
5. ¿Tiempo onboarding? → "5 días, formación incluida, sin coste extra"

---

## POST-DEMO · 15 min después

- [ ] Anotar en CRM Cliender: temperatura (frío/tibio/caliente), objeciones reales, próximo paso comprometido
- [ ] Email follow-up en <2h con: resumen + link entorno trial + propuesta siguiente call
- [ ] Si pidió propuesta concreta → enviar en <24h
