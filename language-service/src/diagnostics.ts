import type { Connection, Diagnostic, PublishDiagnosticsClientCapabilities, TextDocuments } from 'vscode-languageserver'
import type { EFDocument } from './document'

export function enableDiagnostics(
    connection: Connection,
    documents: TextDocuments<EFDocument>,
    cap: PublishDiagnosticsClientCapabilities | undefined,
) {
    if (!cap) return
    documents.onDidChangeContent((change) => {
        const textDocument = change.document
        const diagnostics: Diagnostic[] = textDocument.ast.parseDiagnostics.map((x) => ({
            ...x,
            source: `ef.js`,
        }))
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics })
    })
}
