import type { Connection } from 'vscode-languageserver'
import { CompletionItemKind, CompletionList } from 'vscode-languageserver-types'
import { callExtendedProtocol } from '../../extended-protocol'
import { completion, EmptyCompletion } from '../../utils'

let tagCache: CompletionList
export async function tagCompletion(conn: Connection): Promise<CompletionList> {
    if (tagCache) return tagCache
    const result = await callExtendedProtocol(conn).requestCompletionFrom(
        ...completion.html`<${completion.cursor}`,
        CompletionItemKind.Property,
    )
    if (!result) return EmptyCompletion
    result.items = result.items.filter((x) => x.label !== '!DOCTYPE')

    if (!result.isIncomplete && result.items.length) {
        tagCache = result
        // store the cache for 30 mins in case we can update them in a very low frequency (e.g. custom elements).
        setTimeout(() => (tagCache = undefined!), 1000 * 60 * 30)
    }
    return result
}
