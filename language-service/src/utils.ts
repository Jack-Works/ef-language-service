import { forEachChildRecursively, Node, SourceFile } from 'ef-parser'
import type { Position, TextDocumentIdentifier, TextDocuments } from 'vscode-languageserver'
import type { EFDocument } from './document'

/** Compatible with ResponseError in vscode */
export class ResponseError<T> extends Error {
    constructor(public message: string, public data: T | undefined = undefined, public readonly code = -1) {
        super(message)
    }
    toJson() {
        return {
            code: this.code,
            message: this.message,
            data: this.data,
        }
    }
}
export const CommonErrors = {
    get documentNotFound() {
        return new ResponseError('Document not found', undefined, 1)
    },
    get requestCancelled() {
        return new ResponseError('Request cancelled', undefined, 2)
    },
}
export function getDocument(param: { textDocument: TextDocumentIdentifier }, documents: TextDocuments<EFDocument>) {
    const d = documents.get(param.textDocument.uri)
    if (!d) throw CommonErrors.documentNotFound
    return d
}

export function getNodeAtPosition(node: SourceFile, pos: Position): Node | undefined {
    const candidates: Node[] = []
    forEachChildRecursively(node, (node) => {
        if (node.line !== pos.line) return
        if (node.character >= pos.character && node.character - node.len < pos.character) candidates.push(node)
        return
    })
    return candidates.sort((a, b) => a.len - b.len)[0] // the minimal length wins
}
