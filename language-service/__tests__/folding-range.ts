import { readFileSync } from 'fs'
import { toMatchFile } from 'jest-file-snapshot'
import { join, resolve } from 'path'
import { parseSourceFile } from 'ef-parser'
import { getFoldingRangeForNode } from '../src/folding-range'

expect.extend({ toMatchFile })

it('should return the document 1 folding range as expected', () => {
    const doc = readFileSync(resolve(__dirname, '../../examples/1.efml'), 'utf-8')
    const ast = parseSourceFile(doc, 'example.efml')

    expect(JSON.stringify(getFoldingRangeForNode(ast), undefined, 4)).toMatchFile(
        join(__dirname, '../__file_snapshots__/1.efml.folding-range.json'),
    )
})
