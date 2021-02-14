import type { Connection } from 'vscode-languageserver'
import type { CompletionItemKind, CompletionList, Position } from 'vscode-languageserver-types'

export interface ExtendedLanguageServiceProtocol {
    requestCompletionFrom(
        extension: 'html' | 'ts' | 'js',
        source: string,
        position: Position,
        filter?: CompletionItemKind,
    ): Promise<CompletionList | undefined>
}
export function callExtendedProtocol(connection: Connection): ExtendedLanguageServiceProtocol {
    return new Proxy(
        {},
        {
            get(_, key: string) {
                return (...args: any[]) => connection.sendRequest(key, [args])
            },
        },
    ) as any
}
