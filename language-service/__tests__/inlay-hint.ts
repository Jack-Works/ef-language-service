import { readFileSync } from 'fs'
import { toMatchFile } from 'jest-file-snapshot'
import { join, resolve } from 'path'
import { parseSourceFile } from 'ef-parser'
import { getInlayHints } from '../src/inlay'

expect.extend({ toMatchFile })

it('should provide inlay hint of document 1 expected', () => {
    const doc = readFileSync(resolve(__dirname, '../../examples/1.efml'), 'utf-8')
    const ast = parseSourceFile(doc, 'example.efml')

    expect(JSON.stringify(getInlayHints(ast), undefined, 4)).toMatchFile(
        join(__dirname, '../__file_snapshots__/1.efml.inlay-hint.json'),
    )
})
