import type { Mutable } from '../utils'
import {
    CommentLine,
    ElementAttributeDeclarationLine,
    ElementPropertyDeclarationLine,
    ElementDeclarationLine,
    ElementEventLine,
    MountingPointLine,
    MustachesExpression,
    SourceFile,
    StringLiteral,
    SyntaxKind,
    TagDescriptor,
    TemplateExpression,
    TextLine,
    NodePosition,
    Token,
    TokenSyntaxKind,
    Node,
    LineBase,
    MutableNodeArray,
    LanguageVariant,
    DottedExpressionChain,
    InlineNode,
} from './ast'
/** The node is in the constructing stage and have no position information. */
export type ConstructingNode<T extends Node> = Mutable<Omit<T, keyof NodePosition> & Partial<NodePosition>>
export function createSourceFile(
    path: SourceFile['path'],
    text: SourceFile['text'],
    languageVariant: LanguageVariant,
    children: SourceFile['children'],
    endOfFileToken: SourceFile['endOfFileToken'],
    diagnostics: SourceFile['diagnostics'],
): ConstructingNode<SourceFile> {
    return { kind: SyntaxKind.SourceFile, path, languageVariant, children, endOfFileToken, diagnostics, text }
}
export function createMountingPointLine(
    indent: string,
    token: MountingPointLine['token'],
    identifier: StringLiteral,
    endOfLineToken: LineBase['endOfLineToken'],
): ConstructingNode<MountingPointLine> {
    return {
        kind: SyntaxKind.MountingPointDeclaration,
        indent,
        indentLevel: indent.length,
        token,
        identifier,
        endOfLineToken,
    }
}

export function createToken<T extends TokenSyntaxKind>(kind: T, text: string): ConstructingNode<Token<T>> {
    return { kind, text } as { kind: T; __type__level__only__brand__: any; text: string }
}
export function createCommentLine(
    indent: string,
    text: string,
    endOfLineToken: LineBase['endOfLineToken'],
): ConstructingNode<CommentLine> {
    return { kind: SyntaxKind.CommentLine, indent, indentLevel: indent.length, text, endOfLineToken }
}
export function createElementDeclarationLine(
    indent: string,
    tag: TagDescriptor,
    endOfLineToken: LineBase['endOfLineToken'],
    children: ElementDeclarationLine['children'],
): ConstructingNode<ElementDeclarationLine> {
    return {
        kind: SyntaxKind.ElementDeclaration,
        indent,
        indentLevel: indent.length,
        tag,
        endOfLineToken,
        children,
    }
}
export function createTagDescriptor(
    startToken: TagDescriptor['startToken'],
    tagName: TagDescriptor['tagName'],
    attributes: TagDescriptor['attributes'],
    reference: TagDescriptor['reference'],
): ConstructingNode<TagDescriptor> {
    return {
        kind: SyntaxKind.TagExpression,
        startToken,
        tagName,
        attributes,
        reference,
    }
}
export function createElementAttributeLine(
    indent: string,
    startToken: ElementAttributeDeclarationLine['startToken'],
    binding: ElementAttributeDeclarationLine['binding'],
    initializer: ElementAttributeDeclarationLine['initializer'],
    endOfLineToken: LineBase['endOfLineToken'],
): ConstructingNode<ElementAttributeDeclarationLine> {
    return {
        kind: SyntaxKind.ElementAttributeDeclaration,
        indent,
        indentLevel: indent.length,
        startToken,
        binding,
        initializer,
        endOfLineToken,
    }
}
export function createElementPropertyLine(
    indent: string,
    startToken: ElementPropertyDeclarationLine['startToken'],
    binding: ElementPropertyDeclarationLine['binding'],
    updateOnly: ElementPropertyDeclarationLine['updateOnly'],
    triggerEvent: ElementPropertyDeclarationLine['triggerEvent'],
    initializer: ElementPropertyDeclarationLine['initializer'],
    endOfLineToken: LineBase['endOfLineToken'],
): ConstructingNode<ElementPropertyDeclarationLine> {
    return {
        kind: SyntaxKind.ElementPropertyDeclaration,
        indent,
        indentLevel: indent.length,
        startToken,
        binding,
        updateOnly,
        triggerEvent,
        initializer,
        endOfLineToken,
    }
}
export function createElementEventLine(
    indent: string,
    atToken: ElementEventLine['atToken'],
    event: ElementEventLine['event'],
    modifier: ElementEventLine['modifier'],
    equalsToken: ElementEventLine['equalsToken'],
    handler: ElementEventLine['handler'],
    parameter: ElementEventLine['parameter'],
    endOfLineToken: LineBase['endOfLineToken'],
): ConstructingNode<ElementEventLine> {
    return {
        kind: SyntaxKind.ElementEventHandlerDeclaration,
        indent,
        indentLevel: indent.length,
        atToken,
        event,
        modifier,
        equalsToken,
        handler,
        parameter,
        endOfLineToken: endOfLineToken,
    }
}
export function createTextLine(
    indent: string,
    token: TextLine['token'],
    content: TextLine['content'],
    endOfLineToken: LineBase['endOfLineToken'],
): ConstructingNode<TextLine> {
    return {
        kind: SyntaxKind.TextLine,
        indent,
        indentLevel: indent.length,
        token,
        content,
        endOfLineToken,
    }
}
export function createTemplateExpression(content: TemplateExpression['content']): ConstructingNode<TemplateExpression> {
    return { kind: SyntaxKind.TemplateStringExpression, content }
}
export function createMustachesExpression(
    startToken: MustachesExpression['startToken'],
    expression: MustachesExpression['expression'],
    initializer: MustachesExpression['initializer'],
    endToken: MustachesExpression['endToken'],
    syncOnly: MustachesExpression['syncOnly'],
): ConstructingNode<MustachesExpression> {
    return {
        kind: SyntaxKind.MustacheExpression,
        startToken,
        expression,
        initializer,
        endToken,
        syncOnly,
    }
}
export function createStringLiteral(value: string): ConstructingNode<StringLiteral> {
    return { kind: SyntaxKind.StringLiteral, text: value }
}
export function createDottedExpressionChain<T extends InlineNode>(
    items: DottedExpressionChain<T>['items'],
): ConstructingNode<DottedExpressionChain<T>> {
    return { kind: SyntaxKind.DottedExpressionChain, items }
}
export function createNodeArray<T extends Node>(): MutableNodeArray<T> {
    return []
}
