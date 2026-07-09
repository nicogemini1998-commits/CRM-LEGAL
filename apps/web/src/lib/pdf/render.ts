import { renderToBuffer as _renderToBuffer } from '@react-pdf/renderer'
import { type ReactElement } from 'react'

export async function renderToBuffer(doc: ReactElement): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf = await _renderToBuffer(doc as any)
  return new Uint8Array(buf instanceof Buffer ? buf : Buffer.from(buf))
}
