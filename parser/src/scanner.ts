import { isDebug } from './debugger'
import { SyntaxKind } from './types/ast'
import { CharacterCodes } from './types/chars'
import { SyntaxKindToString } from './utils'

/**
 * Things work in this way:
 * When current scanning token is {{
 * "    {{"
 *  ^ here is the trivial start
 *
 * "    {{"
 *      ^ here is the token start
 *
 * "    {{"
 *        ^ here is the scanner pos
 */
export interface Scanner {
    getToken(): SyntaxKind
    getTrivialStartPos(): number
    getTokenStartPos(): number
    getScannerPos(): number
    getLeadingTriviaText(): string
    getTokenText(): string
    scan(): SyntaxKind

    /** represents the lined version of getScannerPos(), which means it is the **end** of the current token. Since no token is multiple line, it is very easy to get the start position (whether has trivia or not). */
    getLinedPos(): [line: number, char: number]
    getLastTokenLinedPos(): [line: number, char: number]

    getFullText(): string
    setFullText(text: string | undefined): void

    /** set the scanner back to the 0 position */
    initPos(): void
    /** Invokes the provided callback then restores the scanner to the state it was in immediately prior to invoking the callback. */
    lookAhead<T>(callback: () => T): T
    /** Return the indent level of the next line */
    lookAheadIdentLevel(): number
    /**
     * Invokes the provided callback.
     *
     * If the callback returns falsy, then it restores the scanner to the state it was in immediately prior to invoking the callback.
     *
     * If the callback returns truthy, then the scanner state is not rolled back.
     *
     * The result of invoking the callback is returned from this function.
     */
    tryScan<T>(callback: () => T): T
    /** @internal debug only */
    readonly __start__?: string
    /** @internal debug only */
    readonly __end__?: string
}
export type ScanResult = {
    kind: SyntaxKind
    trivialStart: number
    start: number
    end: number
    text: string
    line: number
    char: number
}
export function createScanner(textInitial: string): Scanner {
    let text = textInitial
    let fileEnd: number

    let token: SyntaxKind
    let lastToken: SyntaxKind

    let line = 0
    let character = 0
    let lastLine = 0
    let lastCharacter = 0

    let trivialStartPos: number
    let tokenStartPos: number
    let pos = 0

    setFullText(text)

    const getTokenText = () => text.substring(tokenStartPos, pos)
    const getLeadingTriviaText = () => text.substring(trivialStartPos, tokenStartPos)
    const scanner: Scanner = {
        getLeadingTriviaText,
        getToken: () => token,
        getTrivialStartPos: () => trivialStartPos,
        getTokenStartPos: () => tokenStartPos,
        getScannerPos: () => pos,
        getTokenText,
        getLinedPos: () => [line, character],
        getLastTokenLinedPos: () => [lastLine, lastCharacter],
        scan,
        getFullText: () => text,
        setFullText,
        initPos,
        tryScan,
        lookAhead,
        lookAheadIdentLevel,
        get __start__() {
            return text.slice(Math.max(0, trivialStartPos - 5), trivialStartPos) + '║' + text.slice(trivialStartPos)
        },
        get __end__() {
            return text.slice(Math.max(0, pos - 5), pos) + '║' + text.slice(pos)
        },
    }

    if (isDebug) {
        Object.defineProperty(global, '_e', {
            get: () => scanner.__end__,
            configurable: true,
        })
        Object.defineProperty(global, '_t', {
            get: () => SyntaxKindToString(token),
            configurable: true,
        })
    }

    return scanner

    function scan(): SyntaxKind {
        trivialStartPos = pos
        tokenStartPos = pos
        lastLine = line
        lastCharacter = character

        if (pos >= fileEnd) return (token = SyntaxKind.EndOfFileToken)
        lastToken = token

        // Scan heading spaces before tokens, therefore add them before the token
        if (isSameLineWhiteSpace(text.codePointAt(pos)!)) {
            const isStartOfLine = character === 0
            scanSameLineWhiteSpace(true)
            // easier to set indentation for the parser
            if (isStartOfLine) return (token = SyntaxKind.WhitespaceSameLineTrivia)
        }
        tokenStartPos = pos

        const ch = text.codePointAt(pos)!
        // Simple tokens
        {
            const simple = isSimpleToken(ch)
            if (simple) {
                pos++, character++
                return (token = simple)
            }
        }

        if (
            // first line
            lastToken === SyntaxKind.Unknown ||
            // line comment with no space ahead
            lastToken === SyntaxKind.NewLineTrivia ||
            // line comment with space ahead
            lastToken === SyntaxKind.WhitespaceSameLineTrivia
        ) {
            const isCommentLine = scanCommentUntilEOL()
            if (isCommentLine) return (token = SyntaxKind.CommentTrivia)
        }

        // Scan {{
        if (ch === CharacterCodes.openBrace && text.codePointAt(pos + 1) === CharacterCodes.openBrace) {
            pos += 2
            character += 2
            return (token = SyntaxKind.MustacheStartToken)
        }
        // Scan }}
        if (ch === CharacterCodes.closeBrace && text.codePointAt(pos + 1) === CharacterCodes.closeBrace) {
            pos += 2
            character += 2
            return (token = SyntaxKind.MustacheEndToken)
        }
        if (isLineBreak(ch)) {
            if (ch === CharacterCodes.carriageReturn) {
                if (text.charCodeAt(pos + 1) === CharacterCodes.lineFeed) {
                    pos++, character++
                }
            }
            pos++, line++
            character = 0
            return (token = SyntaxKind.NewLineTrivia)
        }
        // scan as text fragment
        tokenStartPos = trivialStartPos // count trivial in to the range
        debugger
        while (true) {
            if (pos >= fileEnd) return (token = SyntaxKind.EndOfFileToken)
            pos++
            character++
            const nextCh = text.codePointAt(pos)!
            if (isSameLineWhiteSpace(nextCh)) {
                const shouldBreak = !tryScan(() => {
                    scanSameLineWhiteSpace(false)
                    const next = text.codePointAt(pos)!
                    const shouldKeepState = !(isComplexTokenStart(next) || isSimpleToken(next))
                    return shouldKeepState
                })
                if (shouldBreak) return (token = SyntaxKind.TextFragment)
            }
            if (isTokenStart(nextCh)) return (token = SyntaxKind.TextFragment)
        }
    }

    /**
     * It will try to scan the whole line as a comment.
     */
    function scanCommentUntilEOL() {
        return tryScan(() => {
            let inComment = false
            tokenStartPos = trivialStartPos
            while (pos < fileEnd) {
                const ch = text.codePointAt(pos)!
                if (isLineBreak(ch)) return true
                if (!inComment) {
                    if (canStartNonCommentLine(ch)) return false
                    if (!isSameLineWhiteSpace(ch)) inComment = true
                }
                pos++
                character++
            }
            return true
        })
    }

    /**
     * Scan the continuous whitespace
     */
    function scanSameLineWhiteSpace(setStartPos: boolean) {
        if (setStartPos) {
            trivialStartPos = pos
            tokenStartPos = pos
        }
        while (pos < fileEnd) {
            const ch = text.codePointAt(pos)!
            if (!isSameLineWhiteSpace(ch)) break
            pos++
            character++
        }
    }

    function snapshot() {
        const state = [pos, fileEnd, trivialStartPos, tokenStartPos, token, line, character]
        const state2 = [lastLine, lastCharacter, lastToken]
        return () => {
            ;[pos, fileEnd, trivialStartPos, tokenStartPos, token, line, character] = state
            ;[lastLine, lastCharacter, lastToken] = state2
        }
    }

    function rollbackHelper<T>(callback: () => T, isPure: boolean): T {
        const rollback = snapshot()
        const result = callback()

        if (!result || isPure) rollback()
        return result
    }

    function lookAhead<T>(callback: () => T): T {
        return rollbackHelper(callback, /*isPure*/ true)
    }

    function lookAheadIdentLevel() {
        if (token === SyntaxKind.WhitespaceSameLineTrivia) return getTokenText().length
        return lookAhead(() => {
            scanSameLineWhiteSpace(false)
            return getTokenText().length
        })
    }

    function tryScan<T>(callback: () => T): T {
        return rollbackHelper(callback, /*isPure*/ false)
    }

    function setFullText(newText: string | undefined) {
        text = newText || ''
        fileEnd = text.length
        initPos()
    }

    function initPos() {
        lastToken = pos = trivialStartPos = tokenStartPos = line = character = 0
        token = SyntaxKind.Unknown
    }
}
export function isLineBreak(ch: number) {
    return (
        ch === CharacterCodes.lineFeed ||
        ch === CharacterCodes.carriageReturn ||
        ch === CharacterCodes.lineSeparator ||
        ch === CharacterCodes.paragraphSeparator
    )
}

// If we seen this token at first (besides blank at the start), this is a non-trivial line.
function canStartNonCommentLine(ch: number) {
    return (
        ch === CharacterCodes.hash ||
        ch === CharacterCodes.greaterThan ||
        ch === CharacterCodes.percent ||
        ch === CharacterCodes.at ||
        ch === CharacterCodes.dot ||
        ch === CharacterCodes.plus ||
        ch === CharacterCodes.minus ||
        ch === CharacterCodes.bar
    )
}

function isSimpleToken(ch: number): SyntaxKind | undefined {
    if (ch === CharacterCodes.greaterThan) return SyntaxKind.GreaterThanToken
    if (ch === CharacterCodes.equals) return SyntaxKind.EqualsToken
    if (ch === CharacterCodes.dot) return SyntaxKind.DotToken
    if (ch === CharacterCodes.hash) return SyntaxKind.HashToken
    if (ch === CharacterCodes.percent) return SyntaxKind.PercentToken
    if (ch === CharacterCodes.at) return SyntaxKind.AtToken
    if (ch === CharacterCodes.bar) return SyntaxKind.BarToken
    if (ch === CharacterCodes.colon) return SyntaxKind.ColonToken
    if (ch === CharacterCodes.minus) return SyntaxKind.MinusToken
    if (ch === CharacterCodes.plus) return SyntaxKind.PlusToken
    return undefined
}
function isComplexTokenStart(ch: number) {
    if (ch === CharacterCodes.openBrace) return true
    if (ch === CharacterCodes.closeBrace) return true
    return false
}
function isTokenStart(ch: number) {
    return isComplexTokenStart(ch) || isSimpleToken(ch) || isLineBreak(ch)
}
export function isSameLineWhiteSpace(ch: number): boolean {
    return (
        ch === CharacterCodes.space ||
        ch === CharacterCodes.tab ||
        ch === CharacterCodes.verticalTab ||
        ch === CharacterCodes.formFeed ||
        ch === CharacterCodes.nonBreakingSpace ||
        ch === CharacterCodes.nextLine ||
        ch === CharacterCodes.ogham ||
        (ch >= CharacterCodes.enQuad && ch <= CharacterCodes.zeroWidthSpace) ||
        ch === CharacterCodes.narrowNoBreakSpace ||
        ch === CharacterCodes.mathematicalSpace ||
        ch === CharacterCodes.ideographicSpace ||
        ch === CharacterCodes.byteOrderMark
    )
}
