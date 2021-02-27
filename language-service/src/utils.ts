import { forEachChildRecursively, Node, SourceFile, SyntaxKind, TokenSyntaxKind } from 'ef-parser'
import type { CompletionList, Position, TextDocumentIdentifier, TextDocuments } from 'vscode-languageserver'
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
    const token = candidates.find((x) => TokenSyntaxKind.includes(x.kind as any))
    if (token) return token
    return candidates.sort((a, b) => a.len - b.len)[0] // the minimal length wins
}

const cursor = Symbol()
export const completion = (() => {
    const f = <T extends string>(tag: T) => (source: TemplateStringsArray, ...args: (string | typeof cursor)[]) => {
        const pos: Position = { line: 0, character: 0 }

        let beforeCursor = ''

        const file = source.reduce((str, curr, index) => {
            if (index === args.length) return str + curr
            const arg = args[index]
            if (typeof arg === 'symbol') return (beforeCursor = str + curr)
            return str + curr + arg
        }, '')

        let lastLine = ''
        for (const line of beforeCursor.split('\n')) {
            pos.line++
            lastLine = line
        }
        pos.line--
        pos.character = lastLine.length

        return [tag, file, pos] as const
    }
    return { html: f('html'), ts: f('ts'), js: f('js'), cursor } as const
})()

export function getParentNativeTagName(node: Node) {
    if (node.parent?.kind === SyntaxKind.ElementDeclaration) {
        const tag = node.parent.tag.tagName.text
        // upper case tag is not a native tag.
        if (tag.match(/^[A-Z]/)) return false
        return tag
    }
    return false
}

export const EmptyCompletion: CompletionList = { items: [], isIncomplete: false }
/** @internal */
export function assertNever(x: never): never {
    debugger
    console.error(x)
    throw new Error('Never case happened')
}
/** @internal */
export function last<T>(x: readonly T[]): T | undefined {
    return x[x.length - 1]
}
