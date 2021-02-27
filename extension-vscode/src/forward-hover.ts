import type { ExtendedLanguageServiceProtocolClientMethod } from 'ef-language-service-server'
import { commands, Hover as VSCodeHover } from 'vscode'
import { createNewVirtualFile } from './forward-utils'
import { Hover, MarkupKind } from 'vscode-languageclient'

type f = ExtendedLanguageServiceProtocolClientMethod['requestHoverInfoFrom']
export async function forwardHover(...[lang, source, position]: Parameters<f>): ReturnType<f> {
    const [uri, cleanup] = createNewVirtualFile(lang, source)

    const result = await commands.executeCommand<VSCodeHover[]>('vscode.executeHoverProvider', uri, position)
    cleanup()
    return reduce(result)
}

function reduce(hovers: undefined | VSCodeHover[]): Hover | undefined {
    if (!hovers) return undefined
    let value = ''
    for (const hover of hovers) {
        if (typeof hover === 'string') value += hover
        else {
            for (const each of hover.contents) {
                if (typeof each === 'string') value += each
                else value += each.value
            }
        }
        value += '\n'
    }
    return { contents: { kind: MarkupKind.Markdown, value } }
}
