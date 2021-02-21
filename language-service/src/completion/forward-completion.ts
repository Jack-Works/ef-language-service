import { SourceFile, SyntaxKind } from 'ef-parser'
import type { CompletionList, Connection, Position } from 'vscode-languageserver'
import { getNodeAtPosition } from '../utils'
import { propertyCompletion } from './forwarded-completions/property'
import { tagCompletion } from './forwarded-completions/tag'
import { attributeOrEventCompletion } from './forwarded-completions/attribute-event'
import { EmptyCompletion } from '../utils'

export async function getForwardedCompletionItems(
    conn: Connection,
    node: SourceFile,
    position: Position,
): Promise<CompletionList> {
    const current = getNodeAtPosition(node, position)
    if (!current) return EmptyCompletion
    const parent = current.parent
    if (!parent) return EmptyCompletion

    if (current.kind === SyntaxKind.GreaterThanToken && parent.kind === SyntaxKind.TagExpression) {
        return tagCompletion(conn)
    }
    if (current.kind === SyntaxKind.HashToken && parent.kind === SyntaxKind.ElementAttributeDeclaration) {
        return attributeOrEventCompletion(conn, parent, 'attr')
    }
    if (current.kind === SyntaxKind.AtToken && parent.kind === SyntaxKind.ElementEventHandlerDeclaration) {
        return attributeOrEventCompletion(conn, parent, 'event')
    }
    if (
        current.kind === SyntaxKind.AtToken &&
        parent.kind === SyntaxKind.ElementPropertyDeclaration &&
        parent.triggerEvent?.[0] === current
    ) {
        return attributeOrEventCompletion(conn, parent, 'event')
    }
    if (current.kind === SyntaxKind.PercentToken && parent.kind === SyntaxKind.ElementPropertyDeclaration) {
        return propertyCompletion(conn, parent)
    }
    return EmptyCompletion
}
