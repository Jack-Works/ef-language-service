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
    EndOfFileToken,
    FirstNode = 100,
    SourceFile = FirstNode,
    CommentLine,
    ElementDeclarationLine,
    ElementAttributeOrPropertyDeclaration,
    ElementEventHandlerDeclaration,
    MountingPointDeclaration,
    TemplateStringExpression,
    TagExpression,
    TextLine,
    MustacheExpression,
    StringLiteral,
}
export interface LinelessTextRange {
    pos: number
    end: number
}
export interface LinedTextRange extends Position {
    len: number
}
export interface NodeBase extends LinelessTextRange, LinedTextRange {
    readonly kind: SyntaxKind
    readonly parent?: Node
    /** @internal */ readonly missing?: boolean
    /** @internal debug only */ readonly __kind__?: string
}
export interface Token<TKind extends TokenSyntaxKind> extends NodeBase {
    readonly kind: TKind
    readonly _tokenBrand?: any
}
/** An efml SourceFile */
export interface SourceFile extends NodeBase {
    readonly kind: SyntaxKind.SourceFile
    readonly children: NodeArray<Line | CommentLine>
    readonly endOfFileToken: Token<SyntaxKind.EndOfFileToken>
    readonly fileName: string
    readonly text: string
    /** @internal */ readonly path: string
    readonly parseDiagnostics: Diagnostic[]
}
/** Node kind that can use at the top level, so it will have a indent */
export interface LineBase extends NodeBase {
    readonly indentLevel: number
    readonly indent: string
    readonly endOfLineToken: Token<SyntaxKind.NewLineTrivia | SyntaxKind.EndOfFileToken>
}
/**
 * TODO: make CommentLine a Line too.
 */
export interface CommentLine extends NodeBase {
    readonly kind: SyntaxKind.CommentLine
    readonly text: string
}
/** >tag.a.b.c.{{expr}}#ref\nchildren */
export interface ElementDeclarationLine extends LineBase {
    readonly kind: SyntaxKind.ElementDeclarationLine
    readonly tag: TagExpression
    readonly children: NodeArray<Line | CommentLine>
}
/** >tag.a.b.c.{{expr}}#ref */
export interface TagExpression extends NodeBase {
    readonly kind: SyntaxKind.TagExpression
    readonly startToken: Token<SyntaxKind.GreaterThanToken>
    readonly attributes: NodeArray<TemplateExpression | Token<SyntaxKind.DotToken>>
    readonly reference?: readonly [Token<SyntaxKind.HashToken>, StringLiteral]
}
/** #attr = data */
export interface ElementAttributeOrPropertyDeclarationLine extends LineBase {
    readonly kind: SyntaxKind.ElementAttributeOrPropertyDeclaration
    readonly startToken: Token<SyntaxKind.HashToken | SyntaxKind.PercentToken>
    readonly binding: StringLiteral
    readonly initializer?: readonly [Token<SyntaxKind.EqualsToken>, TemplateExpression]
}
/** @a.b.c.123.d = identifier */
/** @a.b.c.123.d = identifier:expr */
export interface ElementEventLine extends LineBase {
    readonly kind: SyntaxKind.ElementEventHandlerDeclaration
    readonly atToken: Token<SyntaxKind.AtToken>
    readonly eventDescriptor: NodeArray<Token<SyntaxKind.DotToken> | StringLiteral>
    readonly equalsToken: Token<SyntaxKind.EqualsToken>
    readonly handler: StringLiteral
    readonly parameter?: readonly [Token<SyntaxKind.ColonToken>, TemplateExpression]
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
    readonly expression: NodeArray<StringLiteral | Token<SyntaxKind.DotToken>>
    readonly initializer?: readonly [Token<SyntaxKind.EqualsToken>, StringLiteral]
    readonly endToken: Token<SyntaxKind.MustacheEndToken>
}
export interface StringLiteral extends NodeBase {
    readonly kind: SyntaxKind.StringLiteral
    readonly value: string
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
export type Line =
    | CommentLine
    | ElementEventLine
    | ElementDeclarationLine
    | ElementAttributeOrPropertyDeclarationLine
    | MountingPointLine
    | TextLine
export type Node =
    | Line
    | SourceFile
    | StringLiteral
    | TagExpression
    | TemplateExpression
    | MustachesExpression
    | StringLiteral
    | Token<TokenSyntaxKind>
