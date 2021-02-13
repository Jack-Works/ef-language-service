import { Node, NodeArray, SyntaxKind } from './ast'
import { isToken, assertNever } from '../utils'
export function visitNode<T>(callback: (node: Node) => T, node: Node | undefined): T | undefined {
    return node && callback(node)
}
export function visitNodes<T>(
    callback: (node: Node) => T,
    callbackNodes: ((node: NodeArray<Node>) => T | undefined) | undefined,
    nodes: NodeArray<Node> | undefined,
): T | undefined {
    if (!nodes) return
    if (callbackNodes) return callbackNodes(nodes)
    for (const node of nodes) {
        const result = callback(node)
        if (result) return result
    }
    return
}
export function forEachChild<T>(
    node: Node,
    callback: (node: Node) => T | undefined,
    callbackNodes?: (nodes: NodeArray<Node>) => T | undefined,
): T | undefined {
    if (!node) return
    const x = (n: Node | undefined) => visitNode(callback, n)
    const xs = (n: NodeArray<any> | undefined) => visitNodes(callback, callbackNodes, n)
    switch (node.kind) {
        case SyntaxKind.SourceFile:
            return xs(node.children) || x(node.endOfFileToken)
        case SyntaxKind.ElementDeclarationLine:
            return x(node.tag) || xs(node.children)
        case SyntaxKind.TagExpression:
            return (
                x(node.startToken) ||
                xs(node.attributes) ||
                (node.reference ? x(node.reference[0]) || x(node.reference[1]) : undefined)
            )
        case SyntaxKind.ElementAttributeOrPropertyDeclaration:
            return (
                x(node.startToken) ||
                x(node.binding) ||
                (node.initializer ? x(node.initializer[0]) || x(node.initializer[1]) : undefined)
            )
        case SyntaxKind.ElementEventHandlerDeclaration:
            return (
                x(node.atToken) ||
                xs(node.eventDescriptor) ||
                x(node.equalsToken) ||
                x(node.handler) ||
                (node.parameter ? x(node.parameter[0]) || x(node.parameter[1]) : undefined)
            )
        case SyntaxKind.TextLine:
            return x(node.token) || x(node.content)
        case SyntaxKind.MountingPointDeclaration:
            return x(node.token) || x(node.identifier)
        case SyntaxKind.MustacheExpression:
            return (
                x(node.startToken) ||
                xs(node.expression) ||
                (node.initializer ? x(node.initializer[0]) || x(node.initializer[1]) : undefined) ||
                x(node.endToken)
            )
        case SyntaxKind.TemplateStringExpression:
            return xs(node.content)
        case SyntaxKind.CommentLine:
            return x(node.endOfLineToken)
        case SyntaxKind.StringLiteral:
            return undefined
    }
    if (!isToken(node)) assertNever(node)
    return undefined
}
export function forEachChildRecursively<T>(
    node: Node,
    callback: (node: Node) => T | undefined,
    callbackNodes?: (nodes: NodeArray<Node>) => T | undefined,
): T | undefined {
    return forEachChild(
        node,
        (node) => callback(node) || forEachChildRecursively(node, callback, callbackNodes),
        callbackNodes
            ? (nodes) => {
                  const x = callbackNodes(nodes)
                  if (x) return x
                  for (const node of nodes) {
                      const x = forEachChildRecursively(node, callback, callbackNodes)
                      if (x) return x
                  }
                  return undefined
              }
            : undefined,
    )
}
