/**
 * Document Parser — PDF/DOCX/TXT → Markdown
 *
 * Strategy:
 * - PDF  → pdf-parse (text extraction) → structure as Markdown
 * - DOCX → mammoth (HTML extraction) → Turndown (→ Markdown)
 * - TXT  → minimal wrapping
 *
 * The caller stores original file for download; AI receives Markdown.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string; numpages: number }>
import mammoth from 'mammoth'
import TurndownService from 'turndown'

export type ParsedDocument = {
  markdown: string
  plainText: string
  pageCount?: number
  wordCount: number
  detectedType: 'contract' | 'brief' | 'nda' | 'employment' | 'corporate' | 'unknown'
  title?: string
  parties?: string[]
  estimatedTokens: number
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

// Detect document type from content keywords
function detectDocumentType(text: string): ParsedDocument['detectedType'] {
  const lower = text.toLowerCase().substring(0, 3000)
  if (/non-disclosure|nda|confidencial(idad)?|acuerdo de confidencialidad/.test(lower)) return 'nda'
  if (/contrato de trabajo|contrato laboral|empleado|empleador|despido|finiquito/.test(lower)) return 'employment'
  if (/estatutos|junta general|consejo de administración|accionista|s\.l\.|s\.a\./.test(lower)) return 'corporate'
  if (/demanda|juzgado|tribunal|auto|sentencia|providencia|recurso|apelación/.test(lower)) return 'brief'
  if (/contrato|partes|cláusula|obligaciones|vigencia|precio|pago/.test(lower)) return 'contract'
  return 'unknown'
}

// Extract parties from common legal patterns
function extractParties(text: string): string[] {
  const parties: string[] = []
  const patterns = [
    /DE UNA PARTE[,:]?\s+([^\n,]+)/gi,
    /DE OTRA PARTE[,:]?\s+([^\n,]+)/gi,
    /PARTE\s+(?:VENDEDORA|COMPRADORA|ARRENDADORA|ARRENDATARIA|EMPLEADORA|TRABAJADORA)[,:]?\s+([^\n,]+)/gi,
    /(?:PRIMERA|SEGUNDA|TERCERA)\.\-?\s+([^\n]+)/gi,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const party = match[1].trim().replace(/\s+/g, ' ')
      if (party.length > 2 && party.length < 100) parties.push(party)
      if (parties.length >= 4) break
    }
  }
  return [...new Set(parties)].slice(0, 4)
}

// Extract document title (first heading-like line)
function extractTitle(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines.slice(0, 15)) {
    if (
      line.length > 5 &&
      line.length < 120 &&
      (line === line.toUpperCase() || /^(CONTRATO|ACUERDO|ESCRITURA|CONVENIO|DEMANDA|AUTO|NDA|ESTATUTOS)/i.test(line))
    ) {
      return line
    }
  }
  return lines[0]?.substring(0, 100)
}

// Convert raw text to structured Markdown
function textToMarkdown(text: string, title?: string): string {
  const lines = text.split('\n')
  const md: string[] = []

  if (title) md.push(`# ${title}\n`)

  let inClause = false
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { md.push(''); continue }

    // All-caps short lines → H2 headings
    if (line === line.toUpperCase() && line.length > 4 && line.length < 80 && /[A-ZÁÉÍÓÚÑ]/.test(line)) {
      md.push(`\n## ${line}\n`)
      inClause = false
      continue
    }

    // Numbered clauses → H3
    if (/^(CLÁUSULA|ARTÍCULO|APARTADO|SECCIÓN|CAPÍTULO)\s+\w+/i.test(line) ||
        /^\d+[\.\-]\s+[A-ZÁÉÍÓÚÑ]/.test(line)) {
      md.push(`\n### ${line}`)
      inClause = true
      continue
    }

    // Sub-items with letters → unordered list
    if (/^[a-z]\)\s+/.test(line)) {
      md.push(`- ${line.substring(3)}`)
      continue
    }

    md.push(inClause ? line : line)
  }

  return md.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export async function parseBuffer(buffer: Buffer, mimeType: string, filename: string): Promise<ParsedDocument> {
  let rawText = ''
  let pageCount: number | undefined

  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
    const data = await pdfParse(buffer)
    rawText = data.text
    pageCount = data.numpages
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    const result = await mammoth.convertToHtml({ buffer })
    rawText = turndown.turndown(result.value)
  } else {
    // Plain text or unknown
    rawText = buffer.toString('utf-8')
  }

  const plainText = rawText.replace(/\s+/g, ' ').trim()
  const title = extractTitle(rawText)
  const detectedType = detectDocumentType(rawText)
  const parties = extractParties(rawText)
  const markdown = textToMarkdown(rawText, title)
  const wordCount = plainText.split(/\s+/).length
  // Rough token estimate: ~1.3 tokens per word for Spanish legal text
  const estimatedTokens = Math.round(wordCount * 1.3)

  return { markdown, plainText, pageCount, wordCount, detectedType, title, parties, estimatedTokens }
}

export async function parseFile(file: File): Promise<ParsedDocument> {
  const buffer = Buffer.from(await file.arrayBuffer())
  return parseBuffer(buffer, file.type, file.name)
}
