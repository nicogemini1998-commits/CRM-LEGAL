import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { anthropic, MODEL } from '@/lib/claude/client'

const VALID = ['sentencia','citacion','contrato','hoja_encargo','demanda','recurso','informe_pericial','escritura','escrito','informe','otro'] as const
type DocType = typeof VALID[number]

const SYSTEM = `Eres un clasificador de documentos jurídicos españoles. Lee el fragmento de texto y responde SOLO con UNA palabra de esta lista exacta:
sentencia | citacion | contrato | hoja_encargo | demanda | recurso | informe_pericial | escritura | escrito | informe | otro

Reglas:
- Sentencias TS/TSJ/AP → sentencia
- Citaciones judiciales → citacion
- Contratos privados (NDA, arrendamiento, JV, compraventa) → contrato
- Hojas de encargo de honorarios → hoja_encargo
- Demandas (laboral/civil/penal) → demanda
- Recursos (alzada/apelación/contencioso) → recurso
- Informes periciales técnicos → informe_pericial
- Escrituras notariales → escritura
- Escritos procesales (defensa/calificación) → escrito
- Informes y memorandos jurídicos → informe
- Cualquier otra cosa → otro

NO añadas explicación. NO uses comillas. Solo la palabra.`

export async function POST(req: NextRequest) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const text = String(body.documentMarkdown || '').slice(0, 2500)
    if (!text.trim()) {
      return NextResponse.json({ doc_type: 'otro', confidence: 0 })
    }

    const r = await anthropic.client.messages.create({
      model: MODEL,
      max_tokens: 10,
      system: SYSTEM,
      messages: [{ role: 'user', content: text }],
    })

    const raw = (r.content[0] && r.content[0].type === 'text' ? r.content[0].text : '').trim().toLowerCase()
    const matched = VALID.find(v => raw.startsWith(v)) ?? 'otro'
    return NextResponse.json({ doc_type: matched as DocType, confidence: matched === 'otro' ? 0.3 : 0.9 })
  } catch (err) {
    console.error('[classify] error:', err)
    return NextResponse.json({ doc_type: 'otro', confidence: 0 }, { status: 200 })
  }
}
