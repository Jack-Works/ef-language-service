import { parseSourceFile } from 'ef-parser/dist'
import type { Position } from 'vscode-languageserver-types'

export const cursor = Symbol()
export function completionOf(source: TemplateStringsArray, cur: typeof cursor) {
    const x = source.join('')
    const doc = parseSourceFile(x, 'test.ef')
    const pos: Position = { line: 0, character: 0 }
    let lastLine = ''
    for (const line of source[0].split('\n')) {
        pos.line++
        lastLine = line
    }
    pos.line--
    pos.character = lastLine.length
    return [doc, pos] as const
}
