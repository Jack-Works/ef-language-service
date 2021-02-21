import type { Connection } from 'vscode-languageserver'
import type { CompletionItemKind, CompletionList, Position } from 'vscode-languageserver-types'
/** Client should implement those methods to enable extra capabilities of the language service. */
export interface ExtendedLanguageServiceProtocolClientMethod {
    requestCompletionFrom(
        extension: 'html' | 'ts' | 'js',
        source: string,
        position: Position,
        filter?: CompletionItemKind,
    ): Promise<CompletionList | undefined>
}
export interface ExtendedLanguageServiceProtocolServerMethod {}
export function callExtendedProtocol(connection: Connection): ExtendedLanguageServiceProtocolClientMethod {
    return new Proxy(
        {},
        {
            get(_, key: string) {
                return (...args: any[]) => connection.sendRequest(key, [args])
            },
        },
    ) as any
}
