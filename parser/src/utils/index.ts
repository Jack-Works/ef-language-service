import { SyntaxKind, Token, TokenSyntaxKind, Node } from '../types/ast'

export function SyntaxKindToString(x: SyntaxKind) {
    return SyntaxKind[x]
}
export function isToken(x: Node): x is Token<any> {
    return TokenSyntaxKind.includes(x.kind as any)
}

/** @internal */
export type Mutable<T> = {
    -readonly [key in keyof T]: T[key]
}
/** @internal */
export function isArray<T>(x: any): x is readonly T[] {
    return Array.isArray(x)
}
/** @internal */
export function assertNever(x: never): never {
    debugger
    console.error(x)
    throw new Error('Never case happened')
}
