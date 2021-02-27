import { readFileSync } from 'fs'
import { toMatchFile } from 'jest-file-snapshot'
import { join, resolve } from 'path'
import { parseSourceFile } from 'ef-parser'
import { getDocumentSymbol } from '../src/document-symbol'

expect.extend({ toMatchFile })

it('should provide the document symbol of document 1 as expected', () => {
    const doc = readFileSync(resolve(__dirname, '../../examples/1.efml'), 'utf-8')
    const ast = parseSourceFile(doc, 'example.efml')
    const tokens = getDocumentSymbol(ast)

    expect(JSON.stringify(tokens, undefined, 4)).toMatchFile(
        join(__dirname, '../__file_snapshots__/1.efml.document-symbol.json'),
    )
})
