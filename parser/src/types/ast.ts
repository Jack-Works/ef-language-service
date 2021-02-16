import type { Diagnostic, Position } from './diagnostics'

export enum SyntaxKind {
    Unknown = 1,
    WhitespaceSameLineTrivia,
    CommentTrivia,
    NewLineTrivia,
    TextFragment,
    /** <<<<<<< */ ConflictMarkerStartTrivia,
    /** ======= */ ConflictMarkerEqualTrivia,
    /** >>>>>>> */ ConflictMarkerEndTrivia,
    /** > */ GreaterThanToken,
    /** # */ HashToken,
    /** % */ PercentToken,
    /** & */ AmpersandToken,
    /** @ */ AtToken,
    /** . */ DotToken,
    /** | */ BarToken,
    /** + */ PlusToken,
    /** - */ MinusToken,
    /** = */ EqualsToken,
    /** {{ */ MustacheStartToken,
    /** }} */ MustacheEndToken,
    /** & */ EscapedToken,
    /** : */ ColonToken,
    /** ! */ ExclamationToken,
    EndOfFileToken = 99,
    FirstNode = 100,
    SourceFile = FirstNode,
    CommentLine,
    ElementDeclaration,
    ElementAttributeOrPropertyDeclaration,
    ElementEventHandlerDeclaration,
    MountingPointDeclaration,
    TemplateStringExpression,
    TagExpression,
    TextLine,
    MustacheExpression,
    StringLiteral,
    DottedExpressionChain,
}
/**
 * All node excepts SourceFile has position.
 * For multiple line node, it children doesn't contribute to the position.
 */
export interface NodePosition extends Position {
    pos: number
    end: number
    // not use "length" cause when we set length on an array it will be strange
    len: number
}
export interface NodeBaseWithoutPosition {
    readonly kind: SyntaxKind
    /** @internal */ readonly missing?: boolean
    /** @internal debug only */ readonly __kind__?: string
}
export interface NodeBase extends NodeBaseWithoutPosition, NodePosition {
    readonly parent?: Node
}
export interface NodeWithSource {
    /** source text of the node. includes leading trivia */
    readonly text: string
}
export interface Token<TKind extends TokenSyntaxKind> extends NodeBase, NodeWithSource {
    readonly kind: TKind
    readonly __type__level__only__brand__: TKind
}
/** An efml SourceFile */
export interface SourceFile extends NodeBase, NodeWithSource {
    readonly kind: SyntaxKind.SourceFile
    readonly path: string
    readonly languageVariant: LanguageVariant
    readonly children: NodeArray<Line>
    readonly endOfFileToken: Token<SyntaxKind.EndOfFileToken>
    readonly diagnostics: Diagnostic[]
}
export enum LanguageVariant {
    Unknown,
    HTML,
}
/** Node kind that can use at the top level, so it will have a indent */
export interface LineBase extends NodeBase {
    readonly indentLevel: number
    readonly indent: string
    readonly endOfLineToken: Token<SyntaxKind.NewLineTrivia | SyntaxKind.EndOfFileToken>
}
export interface CommentLine extends LineBase, NodeWithSource {
    readonly kind: SyntaxKind.CommentLine
}
/** >tag.a.b.c.{{expr}}#ref\nchildren */
export interface ElementDeclarationLine extends LineBase {
    readonly kind: SyntaxKind.ElementDeclaration
    readonly tag: TagDescriptor
    readonly children: NodeArray<Line>
}
/** >tag.a.b.c.{{expr}}#ref */
export interface TagDescriptor extends NodeBase {
    readonly kind: SyntaxKind.TagExpression
    readonly startToken: Token<SyntaxKind.GreaterThanToken>
    readonly tagName: StringLiteral
    readonly attributes: undefined | [Token<SyntaxKind.DotToken>, DottedExpressionChain<TemplateExpression>]
    readonly reference: undefined | readonly [Token<SyntaxKind.HashToken>, StringLiteral]
}
/**
 * #attr = data
 * %attr = data
 */
export interface ElementAttributeOrPropertyDeclarationLine extends LineBase {
    readonly kind: SyntaxKind.ElementAttributeOrPropertyDeclaration
    readonly startToken: Token<SyntaxKind.HashToken | SyntaxKind.PercentToken>
    readonly binding: StringLiteral
    readonly initializer: undefined | readonly [Token<SyntaxKind.EqualsToken>, TemplateExpression]
}
/** @a.b.c.123.d = identifier */
/** @a.b.c.123.d = identifier:expr */
export interface ElementEventLine extends LineBase {
    readonly kind: SyntaxKind.ElementEventHandlerDeclaration
    readonly atToken: Token<SyntaxKind.AtToken>
    readonly event: StringLiteral
    readonly modifier: undefined | readonly [Token<SyntaxKind.DotToken>, DottedExpressionChain<StringLiteral>]
    readonly equalsToken: Token<SyntaxKind.EqualsToken>
    readonly handler: StringLiteral
    readonly parameter: undefined | readonly [Token<SyntaxKind.ColonToken>, TemplateExpression]
}
/** .text or |text */
export interface TextLine extends LineBase {
    readonly kind: SyntaxKind.TextLine
    readonly token: Token<SyntaxKind.DotToken | SyntaxKind.BarToken>
    readonly content: TemplateExpression
}
/** -expr or +expr */
export interface MountingPointLine extends LineBase {
    readonly kind: SyntaxKind.MountingPointDeclaration
    readonly token: Token<SyntaxKind.MinusToken | SyntaxKind.PlusToken>
    readonly identifier: StringLiteral
}
export interface TemplateExpression extends NodeBase {
    readonly kind: SyntaxKind.TemplateStringExpression
    readonly content: NodeArray<StringLiteral | MustachesExpression>
}
export interface MustachesExpression extends NodeBase {
    readonly kind: SyntaxKind.MustacheExpression
    readonly startToken: Token<SyntaxKind.MustacheStartToken>
    readonly expression: DottedExpressionChain<StringLiteral>
    readonly initializer: undefined | readonly [Token<SyntaxKind.EqualsToken>, StringLiteral]
    readonly endToken: Token<SyntaxKind.MustacheEndToken>
}
export interface StringLiteral extends NodeBase, NodeWithSource {
    readonly kind: SyntaxKind.StringLiteral
}
export interface DottedExpressionChain<N extends InlineNode> extends NodeBase {
    readonly kind: SyntaxKind.DottedExpressionChain
    readonly items: NodeArray<N | Token<SyntaxKind.DotToken>>
}
export interface NodeArray<T extends Node> extends ReadonlyArray<T> {}
/** @internal */
export interface MutableNodeArray<T extends Node> extends Array<T> {}
export const TokenSyntaxKind = [
    SyntaxKind.AtToken,
    SyntaxKind.EndOfFileToken,
    SyntaxKind.AmpersandToken,
    SyntaxKind.GreaterThanToken,
    SyntaxKind.EqualsToken,
    SyntaxKind.DotToken,
    SyntaxKind.HashToken,
    SyntaxKind.PercentToken,
    SyntaxKind.ColonToken,
    SyntaxKind.BarToken,
    SyntaxKind.PlusToken,
    SyntaxKind.MinusToken,
    SyntaxKind.MustacheEndToken,
    SyntaxKind.MustacheStartToken,
    SyntaxKind.NewLineTrivia,
] as const
export type TokenSyntaxKind = typeof TokenSyntaxKind[number]
export const LineSyntaxKind = [
    SyntaxKind.CommentLine,
    SyntaxKind.ElementEventHandlerDeclaration,
    SyntaxKind.ElementDeclaration,
    SyntaxKind.ElementAttributeOrPropertyDeclaration,
    SyntaxKind.MountingPointDeclaration,
    SyntaxKind.TextLine,
] as const
export type LineSyntaxKind = typeof LineSyntaxKind[number]
export type InlineNode =
    | StringLiteral
    | TagDescriptor
    | TemplateExpression
    | MustachesExpression
    | Token<TokenSyntaxKind>
    | DottedExpressionChain<InlineNode>
export type Line =
    | CommentLine
    | ElementEventLine
    | ElementDeclarationLine
    | ElementAttributeOrPropertyDeclarationLine
    | MountingPointLine
    | TextLine
export type Node = SourceFile | Line | InlineNode
