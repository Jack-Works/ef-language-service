import { parseSourceFile } from 'ef-parser'
import { getBasicCompletionItems } from '../../src/completion/basic-completion'
import { toMatchFile } from 'jest-file-snapshot'
import { join } from 'path'
import { completionOf, cursor } from '../utils'

expect.extend({ toMatchFile })

it('should complete event modifier as expected', () => {
    const com = completionOf`
>div
    @click.${cursor}`

    expect(toString(getBasicCompletionItems(...com))).toMatchFile(path('event-modifier-basic.json'))
})

it('should event modifier and remove duplicates', () => {
    const com = completionOf`
>div
    @click.ctrl.meta.stop.alt.${cursor}`

    expect(toString(getBasicCompletionItems(...com))).toMatchFile(path('event-modifier-deduplicate.json'))
})

function path(x: string) {
    return join(__dirname, '../../__file_snapshots__/completions/' + x)
}
function toString(x: any) {
    return JSON.stringify(x, undefined, 4)
}
