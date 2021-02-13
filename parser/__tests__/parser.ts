import { readFileSync } from 'fs'
import { toMatchFile } from 'jest-file-snapshot'
import { join, resolve } from 'path'
import { parseSourceFile } from '../src/parser'
import { SourceFile, SyntaxKind } from '../src/types/ast'
import { DiagnosticSeverity, Diagnostic } from '../src/types/diagnostics'
import { SyntaxKindToString } from '../src/utils'

expect.extend({ toMatchFile })

it('should parse the document 1 as expected', () => {
    const doc = readFileSync(resolve(__dirname, '../../examples/1.efml'), 'utf-8')
    const ast = parseSourceFile(doc, 'example.efml')
    expect(toString(ast)).toMatchFile(join(__dirname, '../__file_snapshots__/1.efml.parse.json'))
    expect(toString(simpleAST(ast))).toMatchFile(join(__dirname, '../__file_snapshots__/1.efml.parse.simple.json'))
    expect(mapErrorToSource(ast, ast.parseDiagnostics)).toMatchFile(
        join(__dirname, '../__file_snapshots__/1.efml.parse-errors.txt'),
    )
})

function toString(q: any) {
    return JSON.stringify(q, undefined, 4)
}

function simpleAST(source: { kind: SyntaxKind } & Record<string, any>): any {
    let result: any = { kind: SyntaxKindToString(source.kind) }
    let hit = false
    for (const key in source) {
        const item = source[key]
        if (!item) continue
        const kind = item.kind
        if (
            kind === SyntaxKind.NewLineTrivia ||
            kind === SyntaxKind.WhitespaceSameLineTrivia ||
            kind === SyntaxKind.EndOfFileToken
        )
            continue
        if (kind && (hit = true)) result[key + '@' + SyntaxKindToString(kind)] = simpleAST(source[key])
        else if (Array.isArray(source[key]) && (hit = true)) {
            result[key] = source[key].map(simpleAST)
        }
    }
    if (!hit) return SyntaxKindToString(source.kind)
    return result
}

function mapErrorToSource(sourceFile: SourceFile, _: Diagnostic[]) {
    let result = ''
    const errors = [..._]
    for (const [lineNo, sourceCode] of sourceFile.text.split('\n').entries()) {
        const indent = 4
        result += `${lineNo}`.padStart(indent) + ' | ' + sourceCode + '\n'
        while (errors.length) {
            const current = errors[0].range.start
            const end = errors[0].range.end
            if (current.line !== lineNo) break

            const { severity, code, message } = errors.shift()!
            // if this is a cross-line error, render with !!!
            // if this is a 0-width error, render with ^
            // otherwise render with ~~~
            // render the error same line if it is 0-width.
            const multipleLine = current.line === end.line
            const length = multipleLine ? end.character - end.character : 10
            const errorUnderline =
                length === 0 ? '^' : multipleLine ? ''.padStart(length, '!') : ''.padStart(length, '~')
            const renderText = `${DiagnosticSeverity[severity]} ${code}: ${message}`
            const head = ''.padStart(indent) + ' | ' + ''.padStart(current.character)
            result += head + errorUnderline
            if (length === 0) result += ' ' + renderText + '\n'
            else result += '\n' + head + renderText + '\n'
        }
    }
    return result
}
