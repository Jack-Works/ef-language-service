import { forEachChildRecursively, SourceFile, SyntaxKind } from 'ef-parser'
import type { Connection, TextDocuments } from 'vscode-languageserver'
import type { EFDocument } from '../document'
import type { ExtendedLanguageServiceProtocolServerMethod, InlayHint } from '../extended-protocol'
import { getDocument } from '../utils'
import { keyboardMap } from './constants'

export function enableUnstableInlayHints(conn: Connection, documents: TextDocuments<EFDocument>) {
    listen(conn, 'onUnstableInlayHints', async (params) => {
        const doc = getDocument(params, documents)
        if (!doc) return []
        return getInlayHints(doc.ast)
    })
}

export function getInlayHints(sourceFile: SourceFile) {
    let hints: InlayHint[] = []
    forEachChildRecursively(sourceFile, (node) => {
        if (node.kind !== SyntaxKind.StringLiteral) return

        const parent = node.parent
        if (!parent) return
        if (parent.kind !== SyntaxKind.DottedExpressionChain) return

        const grandparent = parent.parent
        if (!grandparent) return
        if (grandparent.kind !== SyntaxKind.ElementEventHandlerDeclaration) return

        const key = parseInt(node.text)
        if (isNaN(key)) return
        if (key >= keyboardMap.length) return
        const str = keyboardMap[key]
        if (!str) return // might be empty string
        hints.push({
            label: keyboardMap[key] + ' :',
            position: { line: node.line, character: node.character - node.len },
        })
        return
    })
    return hints
}

function listen<K extends keyof ExtendedLanguageServiceProtocolServerMethod>(
    conn: Connection,
    key: K,
    f: ExtendedLanguageServiceProtocolServerMethod[K],
) {
    conn.onRequest(key, (e) => (f as any)(...e[0]))
}
