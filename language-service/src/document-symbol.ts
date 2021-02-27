import { Node, SyntaxKind, isToken } from 'ef-parser'
import {
    CancellationToken,
    Connection,
    DocumentSymbol,
    DocumentSymbolClientCapabilities,
    Position,
    Range,
    ServerCapabilities,
    SymbolKind,
    TextDocuments,
} from 'vscode-languageserver'
import type { EFDocument } from './document'
import { assertNever, CommonErrors, getDocument, last } from './utils'

export function enableDocumentSymbol(
    connection: Connection,
    documents: TextDocuments<EFDocument>,
    cap: DocumentSymbolClientCapabilities | undefined,
): ServerCapabilities['documentSymbolProvider'] {
    if (!cap) return undefined
    connection.onDocumentSymbol((params, cancel) => {
        const doc = getDocument(params, documents)
        return getDocumentSymbol(doc.ast, cancel)
    })
    return {}
}

export function getDocumentSymbol(node: Node, cancel?: CancellationToken): DocumentSymbol[] {
    if (cancel?.isCancellationRequested) throw CommonErrors.requestCancelled
    switch (node.kind) {
        case SyntaxKind.SourceFile:
            return node.children.flatMap((x) => getDocumentSymbol(x, cancel))
        case SyntaxKind.ElementDeclaration: {
            const start: Position = { line: node.line, character: 0 }
            const lastChildren = last(node.children)
            const end: Position = lastChildren
                ? { line: lastChildren.line, character: lastChildren.character }
                : { line: node.line, character: node.character }
            const symbol: DocumentSymbol = {
                kind: SymbolKind.Field,
                name: node.tag.tagName.text,
                children: node.children.flatMap((x) => getDocumentSymbol(x, cancel)),
                range: Range.create(start, end),
                selectionRange: Range.create(start, end),
            }
            return [symbol]
        }
        case SyntaxKind.MountingPointDeclaration: {
            const start: Position = { line: node.line, character: 0 }
            const end: Position = { line: node.line, character: node.character - 1 }
            const symbol: DocumentSymbol = {
                kind: node.token.kind === SyntaxKind.PlusToken ? SymbolKind.Array : SymbolKind.TypeParameter,
                name: node.identifier.text,
                selectionRange: Range.create(start, end),
                // TODO: per doc this range should includes comments and trivia
                range: Range.create(start, end),
            }
            return [symbol]
        }
        case SyntaxKind.CommentLine:
        case SyntaxKind.ElementAttributeDeclaration:
        case SyntaxKind.ElementPropertyDeclaration:
        case SyntaxKind.TextLine:
        case SyntaxKind.ElementEventHandlerDeclaration:
        case SyntaxKind.TagExpression:
        case SyntaxKind.StringLiteral:
        case SyntaxKind.TemplateStringExpression:
        case SyntaxKind.MustacheExpression:
        case SyntaxKind.DottedExpressionChain:
            return []
        default:
            if (isToken(node)) return []
            assertNever(node)
    }
}
