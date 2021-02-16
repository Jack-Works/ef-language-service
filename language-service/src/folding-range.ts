import { SyntaxKind, ElementDeclarationLine, NodeArray, Node } from 'ef-parser'
import type {
    CancellationToken,
    Connection,
    FoldingRange,
    FoldingRangeClientCapabilities,
    ServerCapabilities,
    TextDocuments,
} from 'vscode-languageserver'
import type { EFDocument } from './document'
import { CommonErrors, getDocument } from './utils'

export function enableFoldingRange(
    connection: Connection,
    documents: TextDocuments<EFDocument>,
    cap: FoldingRangeClientCapabilities | undefined,
): ServerCapabilities['foldingRangeProvider'] {
    if (!cap) return undefined
    connection.onFoldingRanges((params, cancel) => {
        const doc = getDocument(params, documents)
        return getFoldingRangeForNode(doc.ast, cancel)
    })
    return { documentSelector: null, workDoneProgress: false }
}

const memo = new WeakMap<Node | NodeArray<Node>, undefined | FoldingRange | FoldingRange[]>()
export function getFoldingRangeForNode(node: Node, cancel?: CancellationToken): FoldingRange[] {
    if (memo.has(node)) return normalize(memo.get(node))
    if (cancel?.isCancellationRequested) throw CommonErrors.requestCancelled

    if (node.kind === SyntaxKind.SourceFile) return set(getFoldRangeForNodeArray(node.children))
    if (node.kind === SyntaxKind.ElementDeclaration) {
        return set(normalize(getRangeForElementDeclarationLine(node)).concat(getFoldRangeForNodeArray(node.children)))
    }
    return []

    function set(result: undefined | FoldingRange | FoldingRange[]) {
        memo.set(node, result)
        return normalize(result)
    }
}
function normalize(result: undefined | FoldingRange | FoldingRange[]) {
    if (!result) return []
    if (Array.isArray(result)) return result
    return [result]
}
// Provide folding for continuos comment line / multiple line texts
function getFoldRangeForNodeArray(nodes: NodeArray<Node>): FoldingRange[] {
    if (memo.has(nodes)) return memo.get(nodes)! as FoldingRange[]

    const result: FoldingRange[] = []
    memo.set(nodes, result)

    let lastKind = SyntaxKind.Unknown
    let lastTextLineToken = SyntaxKind.Unknown
    let continuos = 1
    let startLine = -1
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index]
        result.push(...getFoldingRangeForNode(node))
        // for 2 cases we think they are no longer continuos:
        // 1. SyntaxKind not equal
        // 2. For TextLine, the inner start token not equal
        if (node.kind !== lastKind || (node.kind === SyntaxKind.TextLine && lastTextLineToken !== node.token.kind)) {
            if (shouldFold()) result.push({ kind: foldingTable[lastKind], startLine, endLine: node.line - 1 })
            lastKind = node.kind
            continuos = 1
            startLine = node.line
        } else continuos++

        if (node.kind === SyntaxKind.TextLine) lastTextLineToken = node.token.kind
        else lastTextLineToken = SyntaxKind.Unknown
    }
    if (shouldFold()) {
        result.push({
            kind: foldingTable[lastKind],
            startLine,
            endLine: nodes[nodes.length - 1].line,
        })
    }
    return result

    function shouldFold() {
        return (
            // must be 3 continuos lines
            continuos >= 3 &&
            // dotted (single line text node) doesn't contribute
            lastTextLineToken !== SyntaxKind.DotToken &&
            // only CommentLine and multiple TextLine contributes
            (lastKind === SyntaxKind.CommentLine || lastKind === SyntaxKind.TextLine)
        )
    }
}
function getRangeForElementDeclarationLine(node: ElementDeclarationLine): FoldingRange | undefined {
    if (memo.has(node)) return memo.get(node)! as FoldingRange

    if (node.children.length === 0) return undefined

    const last = node.children[node.children.length - 1]
    let endLine = last.line

    if (last.kind === SyntaxKind.ElementDeclaration) {
        endLine = getRangeForElementDeclarationLine(last)?.endLine ?? endLine
    }
    const result: FoldingRange = { kind: foldingTable[node.kind], startLine: node.line, endLine }
    memo.set(node, result)
    return result
}
const foldingTable: Partial<Record<SyntaxKind, string>> = {
    [SyntaxKind.ElementDeclaration]: 'element',
    [SyntaxKind.CommentLine]: 'comment',
    [SyntaxKind.TextLine]: 'text',
}
