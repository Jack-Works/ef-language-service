import type {
    TextDocuments,
    Connection,
    CancellationToken,
    SemanticTokensClientCapabilities,
    ServerCapabilities,
} from 'vscode-languageserver/node'
import type { TokenSyntaxKind, TagDescriptor, Token, SourceFile } from 'ef-parser'
import type { EFDocument } from './document'
import { Node, SyntaxKind } from 'ef-parser'
import { CommonErrors, getDocument } from './utils'

export function enableSemanticToken(
    connection: Connection,
    documents: TextDocuments<EFDocument>,
    cap: SemanticTokensClientCapabilities | undefined,
): ServerCapabilities['semanticTokensProvider'] {
    if (!cap) return undefined
    connection.languages.semanticTokens.on((params, cancel) => {
        const doc = getDocument(params, documents)
        return { data: [...toSemanticTokens(toTokenWorker(cancel, doc.ast))] }
    })
    return {
        legend: SemanticTokenLegend as any,
        full: true,
        range: false,
        workDoneProgress: false,
        documentSelector: null,
    }
}
type SemanticToken = [line: number, char: number, length: number, kind: SemanticTokenTypes]
export function* toSemanticTokens(tokenGenerator: IterableIterator<SemanticToken>) {
    let lastLine = 0
    let lastChar = 0
    for (const [line, char, length, kind] of tokenGenerator) {
        const deltaLine = line - lastLine
        const deltaChar = deltaLine === 0 ? char - lastChar : char
        yield* [deltaLine, deltaChar, length, SemanticTokenLegend.tokenTypes.indexOf(kind), 0] as number[]
        lastLine = line
        lastChar = char
    }
}
export function toTokenWorker(cancel: CancellationToken, document: SourceFile) {
    const doc = document.text
    return toToken(document, SemanticTokenTypes.string)
    function* toToken(node: Node, parseStringLiteralAs: SemanticTokenTypes): Generator<SemanticToken> {
        // I doubt if it will work cause it's all synchronous
        if (cancel.isCancellationRequested) throw CommonErrors.requestCancelled
        switch (node.kind) {
            case SyntaxKind.SourceFile:
                for (const line of node.children) yield* toToken(line, parseStringLiteralAs)
                return
            case SyntaxKind.CommentLine:
                return yield tokenOf(node, SemanticTokenTypes.comment)
            case SyntaxKind.ElementDeclaration:
                {
                    const tag = node.tag
                    yield tokenOf(tag.startToken, SemanticTokenTypes.elementStart)
                    yield tokenOf(tag.tagName, SemanticTokenTypes.element)
                    for (const attr of tag.attributes?.[1].items || []) {
                        yield* toToken(attr, SemanticTokenTypes.class)
                    }
                    tag.reference && [
                        yield tokenOf(tag.reference[0], SemanticTokenTypes.reference),
                        yield tokenOf(tag.reference[1], SemanticTokenTypes.reference),
                    ]
                }
                for (const child of node.children) yield* toToken(child, SemanticTokenTypes.string)
                return
            case SyntaxKind.StringLiteral:
                return yield tokenOf(node, parseStringLiteralAs)
            case SyntaxKind.TemplateStringExpression:
                for (const part of node.content) yield* toToken(part, parseStringLiteralAs)
                return
            case SyntaxKind.MustacheExpression:
                yield tokenOf(node.startToken, SemanticTokenTypes.mustacheStart)
                for (const expr of node.expression.items) yield* toToken(expr, SemanticTokenTypes.exoticExpression)
                node.initializer && [
                    yield tokenOf(node.initializer[0], SemanticTokenTypes.operator),
                    yield* toToken(node.initializer[1], SemanticTokenTypes.string),
                ]
                return yield tokenOf(node.endToken, SemanticTokenTypes.mustacheEnd)
            case SyntaxKind.MountingPointDeclaration:
                return yield tokenOf(
                    node,
                    node.token.kind !== SyntaxKind.PlusToken
                        ? SemanticTokenTypes.mountingPoint
                        : SemanticTokenTypes.listMountingPoint,
                )
            case SyntaxKind.ElementEventHandlerDeclaration:
                yield tokenOf(node.atToken, SemanticTokenTypes.event)
                yield tokenOf(node.event, SemanticTokenTypes.event)
                for (const a of node.modifier?.[1].items || []) {
                    yield* toToken(a, SemanticTokenTypes.modifier)
                }
                yield tokenOf(node.equalsToken, SemanticTokenTypes.operator)
                yield tokenOf(node.handler, SemanticTokenTypes.exoticExpression)
                node.parameter && [
                    yield tokenOf(node.parameter[0], SemanticTokenTypes.operator),
                    yield* toToken(node.parameter[1], SemanticTokenTypes.string),
                ]
                return
            case SyntaxKind.TextLine:
                yield tokenOf(node.token, SemanticTokenTypes.operator)
                return yield* toToken(node.content, SemanticTokenTypes.string)
            case SyntaxKind.ElementAttributeDeclaration:
                yield tokenOf(node.startToken, SemanticTokenTypes.attribute)
                yield tokenOf(node.binding, SemanticTokenTypes.attribute)
                node.initializer && [
                    yield tokenOf(node.initializer[0], SemanticTokenTypes.operator),
                    yield* toToken(node.initializer[1], SemanticTokenTypes.string),
                ]
                return
            case SyntaxKind.ElementPropertyDeclaration: {
                yield tokenOf(node.startToken, SemanticTokenTypes.property)
                yield tokenOf(node.binding, SemanticTokenTypes.property)
                node.updateOnly && (yield tokenOf(node.updateOnly, SemanticTokenTypes.operator))
                node.triggerEvent && [
                    yield tokenOf(node.triggerEvent[0], SemanticTokenTypes.event),
                    yield tokenOf(node.triggerEvent[1], SemanticTokenTypes.event),
                ]
                node.initializer && [
                    yield tokenOf(node.initializer[0], SemanticTokenTypes.operator),
                    yield* toToken(node.initializer[1], SemanticTokenTypes.string),
                ]
                return
            }
            case SyntaxKind.DottedExpressionChain:
                debugger
                console.warn('DottedExpressionChain should be handled by their parent cause the meaning has lost here.')
                return
            default:
                unhandledKinds(node)
        }

        function unhandledKinds(_node: TagDescriptor | Token<TokenSyntaxKind>) {}
        function tokenOf(node: Node, type: SemanticTokenTypes): SemanticToken {
            return [node.line, node.character - node.len, node.len, type]
        }
    }
}

export enum SemanticTokenTypes {
    comment,
    string,
    elementStart,
    class,
    element,
    reference,
    mustacheStart,
    mustacheEnd,
    // Expression that likely comes from another language, e.g. JS
    exoticExpression,
    operator,
    mountingPoint,
    listMountingPoint,
    event,
    modifier,
    property,
    attribute,
}
Object.keys(SemanticTokenTypes).forEach((x) => {
    // @ts-ignore
    if (!Number.isNaN(parseInt(x))) delete SemanticTokenTypes[x]
    // @ts-ignore make it a string enum
    else SemanticTokenTypes[x] = x
})
const SemanticTokenLegend = {
    tokenModifiers: [],
    tokenTypes: (Object.keys(SemanticTokenTypes) as any) as SemanticTokenTypes[],
}
