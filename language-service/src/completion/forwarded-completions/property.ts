import type { ElementAttributeOrPropertyDeclarationLine } from 'ef-parser/src'
import { CompletionItemKind, CompletionList, Connection } from 'vscode-languageserver'
import { callExtendedProtocol } from '../../extended-protocol'
import { completion, EmptyCompletion, getParentTagName } from '../../utils'

// TODO: memo
export async function propertyCompletion(
    conn: Connection,
    node: ElementAttributeOrPropertyDeclarationLine,
): Promise<CompletionList> {
    const tag = getParentTagName(node)
    if (!tag) return EmptyCompletion
    const result = await callExtendedProtocol(conn).requestCompletionFrom(
        ...completion.ts`{
            let _: HTMLElementTagNameMap['${tag}']
            _!.${completion.cursor}
        }`,
        CompletionItemKind.Field,
    )
    return result || EmptyCompletion
}
