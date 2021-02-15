import { Node, SyntaxKind } from 'ef-parser'
import type {
    Connection,
    Hover,
    HoverClientCapabilities,
    Position,
    ServerCapabilities,
    TextDocuments,
} from 'vscode-languageserver'
import type { EFDocument } from './document'
import { completion, getDocument, getNodeAtPosition, getParentNativeTagName } from './utils'
import { callExtendedProtocol, ExternalLanguages } from '.'
import { HTMLEventDescriptorMethods, HTMLEventDescriptorModifiers } from './completion/constant'

export function enableHover(
    connection: Connection,
    documents: TextDocuments<EFDocument>,
    cap: HoverClientCapabilities | undefined,
): ServerCapabilities['hoverProvider'] {
    if (!cap) return

    connection.onHover(async (param, cancel) => {
        const doc = getDocument(param, documents)
        if (!doc) return
        const node = getNodeAtPosition(doc.ast, param.position)
        if (!node) return

        const params = getHoverInfo(node)
        if (!params) return undefined
        let result: Hover | undefined = undefined
        if (isArray(params)) result = await callExtendedProtocol(connection).requestHoverInfoFrom(...params)
        else result = params
        return result
    })
    return { workDoneProgress: false }
}
function getHoverInfo(node: Node): Hover | readonly [ExternalLanguages, string, Position] | undefined {
    const { parent } = node
    if (!parent) return undefined
    //#region Hover on tag
    if (node.kind === SyntaxKind.GreaterThanToken && parent.kind === SyntaxKind.TagExpression) {
        const tag = parent.tagName.text
        if (isCustomComponent(tag)) return undefined
        return completion.html`<${tag}${completion.cursor}>`
    }
    if (node.kind === SyntaxKind.TagExpression) {
        const tag = node.tagName.text
        if (isCustomComponent(tag)) return undefined
        return completion.html`<${tag}${completion.cursor}>`
    }
    //#endregion
    const tag = getParentNativeTagName(parent)
    //#region Hover on attribute
    if (
        (node.kind === SyntaxKind.StringLiteral || node.kind === SyntaxKind.HashToken) &&
        parent.kind === SyntaxKind.ElementAttributeDeclaration
    ) {
        if (!tag) return undefined
        return completion.html`<${tag} ${parent.binding.text}${completion.cursor} />`
    }
    //#endregion
    //#region Hover on events
    if (
        (node.kind === SyntaxKind.AtToken || node.kind === SyntaxKind.StringLiteral) &&
        parent.kind === SyntaxKind.ElementEventHandlerDeclaration
    ) {
        if (!tag) return undefined
        return completion.html`<${tag} on${parent.event.text}${completion.cursor}="" />`
    }
    if (
        node.kind === SyntaxKind.StringLiteral &&
        parent.kind === SyntaxKind.DottedExpressionChain &&
        parent.parent?.kind === SyntaxKind.ElementEventHandlerDeclaration
    ) {
        const modifierName = node.text
        for (const each of [...HTMLEventDescriptorMethods, ...HTMLEventDescriptorModifiers]) {
            if (modifierName === each.label) {
                const hover: Hover = { contents: each.documentation as any }
                return hover
            }
        }
        return undefined
    }
    //#endregion
    //#region Hover on properties
    if (
        (node.kind === SyntaxKind.PercentToken || node.kind === SyntaxKind.StringLiteral) &&
        parent.kind === SyntaxKind.ElementPropertyDeclaration
    ) {
        if (!tag) return undefined
        // (null as HTMLElementTagNameMap['div']).property
        return completion.ts`(null as HTMLElementTagNameMap['${tag.toLowerCase()}']).${parent.binding.text}${
            completion.cursor
        }`
    }
    //#endregion
    return undefined
}
function isCustomComponent(x: string): boolean {
    return x[0].toLowerCase() !== x[0]
}
function isArray(arr: any): arr is readonly any[] {
    return Array.isArray(arr)
}
