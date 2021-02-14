import {
    commands,
    CompletionList as VSCodeCompletionList,
    CompletionItemKind as VSCodeCompletionItemKind,
} from 'vscode'
import { CompletionItemKind, CompletionItem, MarkupKind } from 'vscode-languageclient'
import type { ExtendedLanguageServiceProtocol } from 'ef-language-service-server'
import { createNewVirtualFile } from './forward-utils'

type f = ExtendedLanguageServiceProtocol['requestCompletionFrom']

export async function forwardCompletion(...[lang, source, pos, only]: Parameters<f>): ReturnType<f> {
    const [uri, cleanup] = createNewVirtualFile(lang, source)
    try {
        const result = await commands.executeCommand<VSCodeCompletionList>(
            'vscode.executeCompletionItemProvider',
            uri,
            pos,
        )
        if (!result) return undefined
        const items = result.items
            .map<CompletionItem>(({ label, detail, documentation, filterText, kind }) => ({
                label,
                detail,
                documentation: mapDoc(documentation),
                filterText,
                kind: mapKind(kind),
            }))
            .filter((x) => x.kind !== CompletionItemKind.Text && (only === undefined || x.kind === only))
        return { isIncomplete: !!result.isIncomplete, items }
    } catch (e) {
        console.error(e)
        return undefined
    } finally {
        cleanup()
    }
}
function mapKind(x?: VSCodeCompletionItemKind): CompletionItemKind {
    if (!x) return CompletionItemKind.Text
    // @ts-ignore
    return completionItemKindTable[x] || CompletionItemKind.Text
}
const completionItemKindTable = {
    [VSCodeCompletionItemKind.Text]: CompletionItemKind.Text,
    [VSCodeCompletionItemKind.Method]: CompletionItemKind.Method,
    [VSCodeCompletionItemKind.Function]: CompletionItemKind.Function,
    [VSCodeCompletionItemKind.Constructor]: CompletionItemKind.Constructor,
    [VSCodeCompletionItemKind.Field]: CompletionItemKind.Field,
    [VSCodeCompletionItemKind.Variable]: CompletionItemKind.Variable,
    [VSCodeCompletionItemKind.Class]: CompletionItemKind.Class,
    [VSCodeCompletionItemKind.Interface]: CompletionItemKind.Interface,
    [VSCodeCompletionItemKind.Module]: CompletionItemKind.Module,
    [VSCodeCompletionItemKind.Property]: CompletionItemKind.Property,
    [VSCodeCompletionItemKind.Unit]: CompletionItemKind.Unit,
    [VSCodeCompletionItemKind.Value]: CompletionItemKind.Value,
    [VSCodeCompletionItemKind.Enum]: CompletionItemKind.Enum,
    [VSCodeCompletionItemKind.Keyword]: CompletionItemKind.Keyword,
    [VSCodeCompletionItemKind.Snippet]: CompletionItemKind.Snippet,
    [VSCodeCompletionItemKind.Color]: CompletionItemKind.Color,
    [VSCodeCompletionItemKind.File]: CompletionItemKind.File,
    [VSCodeCompletionItemKind.Reference]: CompletionItemKind.Reference,
    [VSCodeCompletionItemKind.Folder]: CompletionItemKind.Folder,
    [VSCodeCompletionItemKind.EnumMember]: CompletionItemKind.EnumMember,
    [VSCodeCompletionItemKind.Constant]: CompletionItemKind.Constant,
    [VSCodeCompletionItemKind.Struct]: CompletionItemKind.Struct,
    [VSCodeCompletionItemKind.Event]: CompletionItemKind.Event,
    [VSCodeCompletionItemKind.Operator]: CompletionItemKind.Operator,
    [VSCodeCompletionItemKind.TypeParameter]: CompletionItemKind.TypeParameter,
}

function mapDoc(x: VSCodeCompletionList['items'][0]['documentation']): CompletionItem['documentation'] {
    if (!x) return x
    if (typeof x === 'string') return x
    return { kind: MarkupKind.Markdown, value: x.value }
}
