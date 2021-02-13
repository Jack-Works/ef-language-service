import { readFileSync } from 'fs'
import { toMatchFile } from 'jest-file-snapshot'
import { join, resolve } from 'path'
import { parseSourceFile } from 'ef-parser'
import { toTokenWorker, toSemanticTokens } from '../src/semantic-token'

expect.extend({ toMatchFile })

it('should parse the semantic token of document 1 as expected', () => {
    const doc = readFileSync(resolve(__dirname, '../../examples/1.efml'), 'utf-8')
    const ast = parseSourceFile(doc, 'example.efml')
    const tokens = [...toTokenWorker({} as any, ast)]

    expect(JSON.stringify(tokens)).toMatchFile(join(__dirname, '../__file_snapshots__/1.efml.semantic-tokens.json'))

    const compressedSemanticTokens = JSON.stringify([...toSemanticTokens(tokens.values())])
    if (compressedSemanticTokens.includes('-')) throw new Error('Semantic tokens should not have minus position in it.')
    expect(compressedSemanticTokens).toMatchFile(
        join(__dirname, '../__file_snapshots__/1.efml.semantic-tokens-compressed.json'),
    )
})
