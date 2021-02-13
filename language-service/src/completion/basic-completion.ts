import { ElementEventLine, SourceFile, SyntaxKind, Token } from 'ef-parser'
import type { CompletionItem, Position } from 'vscode-languageserver'
import { getNodeAtPosition } from '../utils'
import { HTMLEventDescriptorMethods, HTMLEventDescriptorModifiers } from './constant'

export function getBasicCompletionItems(sf: SourceFile, pos: Position): CompletionItem[] {
    const node = getNodeAtPosition(sf, pos)
    if (!node) return []

    const items: CompletionItem[] = []
    if (
        node.kind === SyntaxKind.DotToken &&
        node.parent?.kind === SyntaxKind.ElementEventHandlerDeclaration &&
        node.parent.eventDescriptor.includes(<Token<SyntaxKind.DotToken>>node)
    ) {
        items.push(...getEventModifierCompletions(node.parent))
    }

    return items
}

function* getEventModifierCompletions(line: ElementEventLine): Generator<CompletionItem> {
    const current = new Set(line.eventDescriptor.map((x) => (x.kind === SyntaxKind.StringLiteral ? x.value : '')))
    for (const each of [...HTMLEventDescriptorModifiers, ...HTMLEventDescriptorMethods]) {
        if (current.has(each.label)) continue
        yield each
    }
}
