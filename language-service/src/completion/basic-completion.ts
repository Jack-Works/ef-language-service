import { ElementEventLine, getEventLineModifiers, SourceFile, SyntaxKind as K } from 'ef-parser'
import type { CompletionItem, Position } from 'vscode-languageserver'
import { getNodeAtPosition } from '../utils'
import { HTMLEventDescriptorMethods, HTMLEventDescriptorModifiers } from './constant'

export function getBasicCompletionItems(sf: SourceFile, pos: Position): CompletionItem[] {
    const node = getNodeAtPosition(sf, pos)
    if (!node) return []

    const items: CompletionItem[] = []
    const { parent } = node
    if (node.kind === K.DotToken && parent) {
        if (parent.kind === K.ElementEventHandlerDeclaration && node === parent.modifier?.[0]) {
            // @event.a.d
            //       ^ here
            items.push(...getEventModifierCompletions(parent))
        } else if (
            parent.kind === K.DottedExpressionChain &&
            parent.parent?.kind === K.ElementEventHandlerDeclaration
        ) {
            // @event.a.b
            //         ^ here
            items.push(...getEventModifierCompletions(parent.parent))
        }
    }

    return items
}

function* getEventModifierCompletions(line: ElementEventLine): Generator<CompletionItem> {
    const current = new Set(getEventLineModifiers(line))
    for (const each of [...HTMLEventDescriptorModifiers, ...HTMLEventDescriptorMethods]) {
        if (current.has(each.label)) continue
        yield each
    }
}
