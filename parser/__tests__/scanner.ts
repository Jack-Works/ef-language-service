import { readFileSync } from 'fs'
import { toMatchFile } from 'jest-file-snapshot'
import { join, resolve } from 'path'
import { createScanner } from '../src/scanner'
import { SyntaxKind } from '../src/types/ast'
import { SyntaxKindToString } from '../src/utils'

expect.extend({ toMatchFile })

it('should scan the document 1 as expected', () => {
    const doc = readFileSync(resolve(__dirname, '../../examples/1.efml'), 'utf-8')
    const result = JSON.stringify([...scannerToSnap(doc)], undefined, 4)
    expect(result).toMatchFile(join(__dirname, '../__file_snapshots__/1.efml.scanner.json'))
})

function* scannerToSnap(doc: string) {
    const {
        scan,
        getTrivialStartPos,
        getTokenStartPos,
        getScannerPos,
        getLastTokenLinedPos,
        getTokenText,
    } = createScanner(doc)
    const iter = doc.split('\n').values()
    let token: SyntaxKind
    do {
        token = scan()
        const trivialStart = getTrivialStartPos()
        const realStart = getTokenStartPos()
        const end = getScannerPos()
        const [line, char] = getLastTokenLinedPos()
        const text = getTokenText()
        const trivialLength = trivialStart !== realStart ? realStart - trivialStart + '+' : ''
        yield `${SyntaxKindToString(token)} at ${trivialLength}${realStart}-${end};Line${line};Char${char};${text}`
        if (text.includes('\n')) {
            yield `${iter.next().value}`
            yield `====================================================`
        }
    } while (token !== SyntaxKind.EndOfFileToken)
}
