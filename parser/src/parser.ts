import { isDebug } from './debugger'
import { createScanner } from './scanner'
import {
    CommentLine,
    ElementAttributeDeclarationLine,
    ElementPropertyDeclarationLine,
    ElementDeclarationLine,
    ElementEventLine,
    Line,
    Node,
    MountingPointLine,
    MustachesExpression,
    NodeArray,
    SourceFile,
    StringLiteral,
    SyntaxKind,
    TagDescriptor,
    TemplateExpression,
    TextLine,
    Token,
    TokenSyntaxKind,
    MutableNodeArray,
    LanguageVariant,
    DottedExpressionChain,
    InlineNode,
} from './types/ast'
import { Diagnostic, DiagnosticMessage, fillMessage, Position } from './types/diagnostics'
import {
    createMountingPointLine,
    createSourceFile,
    createToken,
    createCommentLine,
    createElementAttributeLine,
    createElementPropertyLine,
    createElementDeclarationLine,
    createElementEventLine,
    createTextLine,
    createTagDescriptor,
    createTemplateExpression,
    createStringLiteral,
    createMustachesExpression,
    ConstructingNode,
    createNodeArray,
    createDottedExpressionChain,
} from './types/factory'
import { DiagnosticMessages } from './types/messages'
import { forEachChild } from './types/visitor'
import { SyntaxKindToString } from './utils'

//#region use scanner
let parseDiagnostics: Diagnostic[] = []
let fileName: string = 'undefined.efml'
const {
    initParserState,
    scan,
    getTokenText,
    token,
    getNodePos,
    lookAheadIdentLevel,
    getLinedPos,
    getLastTokenLinedPos,
    getLeadingTriviaText,
    tryParse,
} = (() => {
    const scanner = createScanner('')
    const {
        getTokenText,
        getTrivialStartPos: getNodePos,
        lookAheadIdentLevel,
        getLastTokenLinedPos,
        getLeadingTriviaText,
        getLinedPos,
    } = scanner

    function scan() {
        return (currentToken = scanner.scan())
    }

    let currentToken = SyntaxKind.EndOfFileToken
    function snapshot() {
        const saveParseDiagnostics = [...parseDiagnostics]
        const state = [currentToken]
        return () => {
            ;[currentToken] = state
            parseDiagnostics = saveParseDiagnostics
        }
    }
    function lookAhead<T>(callback: () => T): T {
        return rollbackHelper(callback, /*isPure*/ true)
    }
    function tryParse<T>(callback: () => T): T {
        return rollbackHelper(callback, /*isPure*/ false)
    }
    function rollbackHelper<T>(callback: () => T, isPure: boolean): T {
        const rollback = snapshot()
        let result: T
        scanner.tryScan(() => {
            result = callback()
            return result && !isPure
        })
        if (!(result! && !isPure)) rollback()
        return result!
    }
    return {
        getNodePos,
        scan,
        getTokenText,
        getLeadingTriviaText,
        lookAheadIdentLevel,
        initParserState(text: string) {
            parseDiagnostics = []
            scanner.setFullText(text)
            scan()
        },
        token: () => currentToken,
        getLastTokenLinedPos,
        getLinedPos,
        tryParse,
    }
})()
//#endregion

//#region parser for lines (statements in other languages, take a whole line / multipleLine)
export function parseSourceFile(source: string, _fileName: string, languageVariant = LanguageVariant.HTML): SourceFile {
    initParserState(source)
    fileName = _fileName
    const sourceFile: ConstructingNode<SourceFile> = createSourceFile(
        _fileName,
        source,
        languageVariant,
        parseNodeList(
            () => parseLine(0),
            () => token() !== SyntaxKind.EndOfFileToken,
        ),
        parseExpectedToken(SyntaxKind.EndOfFileToken),
        parseDiagnostics,
    )
    return finishNode(sourceFile, 0, [0, 0], source.length)
}
function parseLine(currentIndentLevel: number): Line {
    return withPos(() => {
        let indent = ''
        if (token() === SyntaxKind.WhitespaceSameLineTrivia) {
            indent = getTokenText()
            scan()
        }
        const k = token()
        if (k === SyntaxKind.HashToken) return parseElementAttributeLine(indent)
        if (k === SyntaxKind.PercentToken) return parseElementPropertyLine(indent)
        if (k === SyntaxKind.GreaterThanToken) return parseElementDeclarationLine(indent, currentIndentLevel)
        if (k === SyntaxKind.AtToken) return parseElementEventLine(indent)
        if (k === SyntaxKind.DotToken || k === SyntaxKind.BarToken) return parseTextLine(indent)
        if (k === SyntaxKind.PlusToken || k === SyntaxKind.MinusToken) return parseMountingPointLine(indent)
        if (k === SyntaxKind.CommentTrivia) return parseCommentLine(indent)
        parseErrorAtCurrentToken(fillMessage(DiagnosticMessages.unexpected_$1, SyntaxKindToString(k)))
        return parseCommentLine(indent)
    })
}
function parseElementAttributeLine(indent: string): ConstructingNode<ElementAttributeDeclarationLine> {
    return createElementAttributeLine(
        indent,
        parseExpectedToken(SyntaxKind.HashToken),
        parseStringLiteralUntil([SyntaxKind.EqualsToken]),
        parseElementAttributeOrPropertyLineInitializer(),
        parseLineEnding(),
    )
}
function parseElementPropertyLine(indent: string): ConstructingNode<ElementPropertyDeclarationLine> {
    return createElementPropertyLine(
        indent,
        parseExpectedToken(SyntaxKind.PercentToken),
        parseStringLiteralUntil([SyntaxKind.EqualsToken, SyntaxKind.AtToken, SyntaxKind.ExclamationToken]),
        parseOptionalToken(SyntaxKind.ExclamationToken),
        token() === SyntaxKind.AtToken
            ? [parseExpectedToken(SyntaxKind.AtToken), parseStringLiteralUntil([SyntaxKind.EqualsToken])]
            : undefined,
        parseElementAttributeOrPropertyLineInitializer(),
        parseLineEnding(),
    )
}
function parseElementAttributeOrPropertyLineInitializer(): ElementPropertyDeclarationLine['initializer'] &
    ElementAttributeDeclarationLine['initializer'] {
    if (token() !== SyntaxKind.EqualsToken) return undefined
    const equal = parseExpectedToken(SyntaxKind.EqualsToken)
    const mayParseSyncOnlyMustaches =
        token() === SyntaxKind.MustacheStartToken
            ? tryParse(() => {
                  const mustaches = parseMustachesExpression(true)
                  if (token() === SyntaxKind.NewLineTrivia) return [equal, mustaches] as const
                  return false as const
              })
            : undefined
    return mayParseSyncOnlyMustaches || [equal, parseTemplateExpressionUntil([])]
}
function parseElementDeclarationLine(indent: string, currentLevel: number): ConstructingNode<ElementDeclarationLine> {
    const expr = parseTagDescriptor()
    const eol = parseLineEnding()
    const nextIndentLevel = lookAheadIdentLevel()
    const children =
        nextIndentLevel === currentLevel
            ? // Return an empty NodeArray
              finishNodeArray(createNodeArray<Line>(), getNodePos())
            : parseNodeList(
                  () => parseLine(nextIndentLevel),
                  () => lookAheadIdentLevel() >= nextIndentLevel,
              )
    return createElementDeclarationLine(indent, expr, eol, children)
}
function parseTextLine(indent: string): ConstructingNode<TextLine> {
    return createTextLine(
        indent,
        parseOptionalToken(SyntaxKind.BarToken) || parseExpectedToken(SyntaxKind.DotToken),
        parseTemplateExpressionUntil([]),
        parseLineEnding(),
    )
}
function parseMountingPointLine(indent: string): ConstructingNode<MountingPointLine> {
    return createMountingPointLine(
        indent,
        parseOptionalToken(SyntaxKind.PlusToken) || parseExpectedToken(SyntaxKind.MinusToken),
        parseStringLiteralUntil([]),
        parseLineEnding(),
    )
}
function parseElementEventLine(indent: string): ConstructingNode<ElementEventLine> {
    return createElementEventLine(
        indent,
        parseExpectedToken(SyntaxKind.AtToken),
        parseStringLiteralUntil([SyntaxKind.DotToken, SyntaxKind.EqualsToken]),
        token() === SyntaxKind.DotToken
            ? [parseExpectedToken(SyntaxKind.DotToken), parseIdentifierAndDotArray()]
            : undefined,
        parseExpectedToken(SyntaxKind.EqualsToken),
        parseStringLiteralUntil([SyntaxKind.ColonToken]),
        token() === SyntaxKind.ColonToken
            ? ([parseExpectedToken(SyntaxKind.ColonToken), parseTemplateExpressionUntil([])] as const)
            : undefined,
        parseLineEnding(),
    )

    function parseIdentifierAndDotArray() {
        return parseDottedExpressionChain(
            () => parseStringLiteralUntil([SyntaxKind.DotToken, SyntaxKind.EqualsToken]),
            isNextTokenNoneOf(SyntaxKind.NewLineTrivia, SyntaxKind.EndOfFileToken, SyntaxKind.EqualsToken),
        )
    }
}
function parseCommentLine(indent: string): CommentLine {
    return withPos(() => {
        let text = getTokenText()
        let current = token()
        while (current !== SyntaxKind.NewLineTrivia && current !== SyntaxKind.EndOfFileToken) {
            current = scan()
            text += getTokenText()
        }
        return createCommentLine(indent, text, parseLineEnding())
    })
}
//#endregion

//#region parse expressions
function parseStringLiteralUntil(kind: SyntaxKind[]): StringLiteral {
    kind.push(SyntaxKind.NewLineTrivia, SyntaxKind.EndOfFileToken)

    return withPos(() => {
        let text = ''
        let current = token()
        while (!kind.includes(current)) {
            text += getTokenText()
            current = scan()
        }
        return createStringLiteral(text)
    })
}
function parseTemplateExpressionUntil(until: SyntaxKind[]): TemplateExpression {
    return withPos(() => {
        return createTemplateExpression(
            parseNodeList(
                () =>
                    token() === SyntaxKind.MustacheStartToken
                        ? parseMustachesExpression(false)
                        : parseStringLiteralUntil([SyntaxKind.MustacheStartToken, ...until]),
                isNextTokenNoneOf(SyntaxKind.NewLineTrivia, SyntaxKind.EndOfFileToken, ...until),
            ),
        )
    })
}
function parseMustachesExpression(mayParseSyncOnlyToken: boolean): MustachesExpression {
    return withPos(() =>
        createMustachesExpression(
            parseExpectedToken(SyntaxKind.MustacheStartToken),
            parseDottedExpressionChain(
                () =>
                    parseStringLiteralUntil([SyntaxKind.DotToken, SyntaxKind.MustacheEndToken, SyntaxKind.EqualsToken]),
                isNextTokenOneOf(SyntaxKind.DotToken, SyntaxKind.TextFragment),
            ),
            token() === SyntaxKind.EqualsToken
                ? ([
                      parseExpectedToken(SyntaxKind.EqualsToken),
                      parseStringLiteralUntil([SyntaxKind.MustacheEndToken]),
                  ] as const)
                : undefined,
            parseExpectedToken(SyntaxKind.MustacheEndToken),
            mayParseSyncOnlyToken ? parseOptionalToken(SyntaxKind.AmpersandToken) : undefined,
        ),
    )
}
function parseTagDescriptor(): TagDescriptor {
    return withPos(() =>
        createTagDescriptor(
            parseExpectedToken(SyntaxKind.GreaterThanToken),
            parseStringLiteralUntil([
                SyntaxKind.DotToken,
                SyntaxKind.HashToken,
                SyntaxKind.MustacheStartToken,
                SyntaxKind.MustacheEndToken,
            ]),
            token() === SyntaxKind.DotToken ? [parseExpectedToken(SyntaxKind.DotToken), parseAttributes()] : undefined,
            token() === SyntaxKind.HashToken
                ? [parseExpectedToken(SyntaxKind.HashToken), parseStringLiteralUntil([])]
                : undefined,
        ),
    )
    function parseAttributes() {
        return parseDottedExpressionChain(
            () => parseTemplateExpressionUntil([SyntaxKind.DotToken, SyntaxKind.EqualsToken, SyntaxKind.HashToken]),
            isNextTokenNoneOf(
                SyntaxKind.NewLineTrivia,
                SyntaxKind.EndOfFileToken,
                SyntaxKind.EqualsToken,
                SyntaxKind.HashToken,
            ),
        )
    }
}
function parseDottedExpressionChain<T extends InlineNode>(
    parseT: () => T,
    shouldContinue: () => boolean,
): DottedExpressionChain<T> {
    return withPos(() =>
        createDottedExpressionChain(
            parseNodeListGenerator(function* () {
                yield parseT()
                while (shouldContinue()) {
                    yield parseExpectedToken(SyntaxKind.DotToken)
                    yield parseT()
                }
            }),
        ),
    )
}
//#endregion

//#region parser tools
function parseLineEnding() {
    return parseOptionalToken(SyntaxKind.EndOfFileToken) || parseExpectedToken(SyntaxKind.NewLineTrivia)
}
function parseNodeList<T extends Node>(parser: () => T | undefined, shouldContinue: () => boolean): NodeArray<T> {
    const arr = createNodeArray<T>()
    const pos = getNodePos()
    while (shouldContinue()) {
        const node = parser()
        if (node === undefined) throw new Error('should continue returns true but the parser did not return anything')
        arr.push(node)
    }
    return finishNodeArray(arr, pos)
}
function parseNodeListGenerator<T extends Node>(parser: () => Generator<T>) {
    const arr = createNodeArray<T>()
    const pos = getNodePos()
    arr.push(...parser())
    return finishNodeArray(arr, pos)
}
function createMissingNode<T extends Token<any> | StringLiteral>(
    kind: T['kind'],
    diagnosticMessage: DiagnosticMessage,
): T {
    if (diagnosticMessage) parseErrorAtCurrentToken(diagnosticMessage)

    const result = kind === SyntaxKind.StringLiteral ? createStringLiteral('') : createToken(kind, '')
    result.missing = true
    return finishNode(result as any, getNodePos(), getLastTokenLinedPos()) as T
}
function parseOptionalToken<TKind extends TokenSyntaxKind>(t: TKind): undefined | Token<TKind> {
    if (token() === t) return parseExpectedToken(t)
    return undefined
}
function parseExpectedToken<T extends TokenSyntaxKind>(kind: T): Token<T> {
    if (token() === kind)
        return withPos(() => {
            const text = getLeadingTriviaText() + getTokenText()
            scan()
            return createToken(kind, text)
        })
    return withPos(() =>
        createMissingNode<Token<T>>(kind, fillMessage(DiagnosticMessages.$1_expected, SyntaxKindToString(kind))),
    )
}
function parseOptional(kind: SyntaxKind) {
    if (token() === kind) {
        scan()
        return true
    }
    return false
}
function parseExpected(kind: SyntaxKind, shouldAdvance = true): boolean {
    if (token() === kind) {
        if (shouldAdvance) scan()
        return true
    }
    parseErrorAtCurrentToken(fillMessage(DiagnosticMessages.$1_expected, SyntaxKindToString(kind)))
    return false
}
//#endregion

function isNextTokenOneOf(...kind: SyntaxKind[]) {
    return () => {
        const t = token()
        return kind.includes(t)
    }
}
function isNextTokenNoneOf(...kind: SyntaxKind[]) {
    return () => {
        const t = token()
        return !kind.includes(t)
    }
}

function finishNodeArray<T extends Node>(nodes: MutableNodeArray<T>, pos: number, end?: number): NodeArray<T> {
    return nodes
}
function withPos<T extends Node>(f: () => ConstructingNode<T>): T {
    const start = getNodePos()
    const before = getLastTokenLinedPos()
    const node = f()
    const after = getLastTokenLinedPos()
    // if it consumes the NewLineTrivia, before.0 !== after.0, we set pos to before.0.
    // since there is no way to get the full line length (don't know where is the end)
    // set it as magic number -1
    // otherwise we can use the after value safely
    return finishNode(node, start, before[0] === after[0] ? after : [before[0], -1])
}
/** Fill in the position info to make it a complete node. */
function finishNode<T extends Node>(
    node: ConstructingNode<T>,
    pos: number,
    [line, char]: ReturnType<typeof getLastTokenLinedPos>,
    end?: number,
): T {
    if (node.kind !== SyntaxKind.SourceFile) _finishPos(), _finishLinedPos()
    if (isDebug) node.__kind__ = SyntaxKindToString(node.kind)
    forEachChild(
        node as any,
        (sub) => defineParent(sub, node),
        (e) => void e.forEach((sub) => defineParent(sub, node)),
    )
    return node as T

    function _finishPos() {
        end = end ?? getNodePos()
        node.pos = pos
        node.end = end
    }
    function _finishLinedPos() {
        let length = node.end! - node.pos!
        if (char === -1) char = length
        node.len = length
        node.line = line
        node.character = char
    }
}
function defineParent(node: any, parent: any) {
    Object.defineProperty(node, 'parent', { configurable: true, value: parent })
}
//#region report error
function parseErrorAtCurrentToken(message: DiagnosticMessage) {
    const pos = getLastTokenLinedPos()
    const start: Position = { line: pos[0], character: pos[1] }
    const end: Position = { line: pos[0], character: getLinedPos()[1] }
    parseDiagnostics.push({ ...message, range: { start, end } })
}
//#endregion
