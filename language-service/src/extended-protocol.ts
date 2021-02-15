import type { Connection } from 'vscode-languageserver'
import type {
    CompletionItemKind,
    CompletionList,
    Position,
    TextDocumentIdentifier,
    Hover,
} from 'vscode-languageserver-types'

export type ExternalLanguages = 'html' | 'ts' | 'js'
/** Client should implement those methods to enable extra capabilities of the language service. */
export interface ExtendedLanguageServiceProtocolClientMethod {
    requestCompletionFrom(
        extension: ExternalLanguages,
        source: string,
        position: Position,
        filter?: CompletionItemKind,
    ): Promise<CompletionList | undefined>
    requestHoverInfoFrom(extension: ExternalLanguages, source: string, position: Position): Promise<Hover | undefined>
}
export interface UnstableInlayHintsParams {
    textDocument: TextDocumentIdentifier
}
export interface InlayHint {
    position: Position
    label: string
}
export interface ExtendedLanguageServiceProtocolServerMethod {
    onUnstableInlayHints(params: UnstableInlayHintsParams): Promise<InlayHint[]>
}
/** @internal */
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
