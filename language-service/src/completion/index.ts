import { LanguageVariant, SourceFile } from 'ef-parser'
import type { CancellationToken } from 'vscode'
import type {
    CompletionClientCapabilities,
    CompletionItem,
    CompletionList,
    Connection,
    Position,
    ServerCapabilities,
    TextDocuments,
} from 'vscode-languageserver'
import type { EFDocument } from '../document'
import { getDocument } from '../utils'
import { getBasicCompletionItems } from './basic-completion'

export function enableCodeCompletion(
    connection: Connection,
    documents: TextDocuments<EFDocument>,
    cap: CompletionClientCapabilities | undefined,
): ServerCapabilities['completionProvider'] {
    if (!cap) return
    connection.onCompletion((param, cancel) => {
        return getCompletionItemAtPosition(getDocument(param, documents).ast, param.position, cancel)
    })
    return {
        resolveProvider: false,
        triggerCharacters: ['.'],
        // TODO: what is this?
        allCommitCharacters: undefined,
        workDoneProgress: false,
    }
}
export function getCompletionItemAtPosition(
    doc: SourceFile,
    pos: Position,
    cancel: CancellationToken,
): CompletionItem[] | CompletionList {
    if (doc.languageVariant !== LanguageVariant.HTML) return []
    return mergeCompletionItems([getBasicCompletionItems(doc, pos)])
}

function mergeCompletionItems(com: (CompletionItem[] | CompletionList)[]): CompletionItem[] | CompletionList {
    const items: CompletionItem[] = []
    let isIncomplete = false
    for (const n of com) {
        if (Array.isArray(n)) items.push(...n)
        else {
            isIncomplete = isIncomplete || n.isIncomplete
            items.push(...n.items)
        }
    }
    if (isIncomplete) return { isIncomplete, items }
    return items
}
