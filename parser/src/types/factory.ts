import type { Mutable } from '../utils'
import {
    CommentLine,
    ElementAttributeOrPropertyDeclarationLine,
    ElementDeclarationLine,
    ElementEventLine,
    MountingPointLine,
    MustachesExpression,
    SourceFile,
    StringLiteral,
    SyntaxKind,
    TagExpression,
    TemplateExpression,
    TextLine,
    LinelessTextRange,
    Token,
    TokenSyntaxKind,
    Node,
    Line,
    LinedTextRange,
    LineBase,
} from './ast'
/** The node is in the constructing stage and have no position information. */
export type ConstructingNode<T extends Node> = Mutable<
    Omit<T, keyof LinelessTextRange | keyof LinedTextRange> & Partial<LinelessTextRange & LinedTextRange>
>
type ConstructingNodeParam<T extends Node> = Omit<ConstructingNode<T>, 'kind'>
export function createSourceFile(opts: ConstructingNodeParam<SourceFile>): ConstructingNode<SourceFile> {
    return { kind: SyntaxKind.SourceFile, ...opts }
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

export function createToken<T extends TokenSyntaxKind>(kind: T): ConstructingNode<Token<T>> {
    return { kind }
}
export function createCommentLine(text: string): ConstructingNode<CommentLine> {
    return { kind: SyntaxKind.CommentLine, text }
}
export function createElementDeclarationLine(
    indent: string,
    tag: TagExpression,
    endOfLineToken: LineBase['endOfLineToken'],
    children: ElementDeclarationLine['children'],
): ConstructingNode<ElementDeclarationLine> {
    return {
        kind: SyntaxKind.ElementDeclarationLine,
        indent,
        indentLevel: indent.length,
        tag,
        endOfLineToken,
        children,
    }
}
export function createTagExpression(
    startToken: TagExpression['startToken'],
    attributes: TagExpression['attributes'],
    reference: TagExpression['reference'],
): ConstructingNode<TagExpression> {
    return {
        kind: SyntaxKind.TagExpression,
        startToken,
        attributes,
        reference,
    }
}

export function createElementAttributeOrPropertyLine(
    indent: string,
    startToken: ElementAttributeOrPropertyDeclarationLine['startToken'],
    binding: ElementAttributeOrPropertyDeclarationLine['binding'],
    initializer: ElementAttributeOrPropertyDeclarationLine['initializer'],
    endOfLineToken: LineBase['endOfLineToken'],
): ConstructingNode<ElementAttributeOrPropertyDeclarationLine> {
    return {
        kind: SyntaxKind.ElementAttributeOrPropertyDeclaration,
        indent,
        indentLevel: indent.length,
        startToken,
        binding,
        initializer,
        endOfLineToken,
    }
}
export function createElementEventLine(
    indent: string,
    atToken: ElementEventLine['atToken'],
    eventDescriptor: ElementEventLine['eventDescriptor'],
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
        eventDescriptor,
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
): ConstructingNode<MustachesExpression> {
    return {
        kind: SyntaxKind.MustacheExpression,
        startToken,
        expression,
        initializer,
        endToken,
    }
}
export function createStringLiteral(value: string): ConstructingNode<StringLiteral> {
    return { kind: SyntaxKind.StringLiteral, value }
}
