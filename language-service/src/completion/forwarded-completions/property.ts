import type { ElementAttributeDeclarationLine, ElementPropertyDeclarationLine } from 'ef-parser/src'
import { CompletionItemKind, CompletionList, Connection } from 'vscode-languageserver'
import { callExtendedProtocol } from '../../extended-protocol'
import { completion, EmptyCompletion, getParentNativeTagName } from '../../utils'

// TODO: memo
export async function propertyCompletion(
    conn: Connection,
    node: ElementAttributeDeclarationLine | ElementPropertyDeclarationLine,
): Promise<CompletionList> {
    const tag = getParentNativeTagName(node)
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
