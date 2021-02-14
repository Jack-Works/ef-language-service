import type { ElementAttributeOrPropertyDeclarationLine, ElementEventLine } from 'ef-parser'
import type { CompletionList, Connection } from 'vscode-languageserver'
import { callExtendedProtocol } from '../../extended-protocol'
import { completion, EmptyCompletion, getParentTagName } from '../../utils'

const attributeCache = new Map<string, CompletionList>()
// TODO: separate cache map
export async function attributeOrEventCompletion(
    conn: Connection,
    node: ElementAttributeOrPropertyDeclarationLine | ElementEventLine,
    kind: 'event' | 'attr',
) {
    const tag = getParentTagName(node)
    if (!tag) return EmptyCompletion
    if (attributeCache.has(tag)) return filter(attributeCache.get(tag)!)

    const result = await callExtendedProtocol(conn).requestCompletionFrom(
        ...completion.html`
            <${tag} ${completion.cursor}
        `,
    )
    if (!result) return EmptyCompletion
    if (result.items.length && !result.isIncomplete && !tag.includes('-') && tag[0].toLowerCase() === tag[0]) {
        // only cache for native tags, never outdated
        attributeCache.set(tag, result)
    }
    return filter(result)
    function filter(result: CompletionList): CompletionList {
        const items =
            kind === 'event'
                ? result.items
                      .filter((x) => x.label.startsWith('on'))
                      .map((x) => ({ ...x, label: x.label.replace(/^on/, '') }))
                : result.items.filter((x) => !x.label.startsWith('on'))
        return { ...result, items }
    }
}
