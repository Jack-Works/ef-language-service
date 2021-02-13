import type { CompletionItem } from 'vscode-languageserver'
import { MarkupKind, CompletionItemKind } from 'vscode-languageserver-types'

export const HTMLEventDescriptorModifiers: ReadonlySet<CompletionItem> = new Set([
    {
        label: 'alt',
        kind: CompletionItemKind.EnumMember,
        detail: 'EventDescriptorModifiers.alt',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
                'Invoke this event only when the `alt` key (`Option` or `⌥` on OS X) was pressed.\n\nSee [KeyboardEvent.altKey](https://mdn.io/KeyboardEvent.altKey)',
        },
    },
    {
        label: 'ctrl',
        kind: CompletionItemKind.EnumMember,
        detail: 'EventDescriptorModifiers.ctrl',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
                'Invoke this event only when the `ctrl` key was pressed.\n\nSee [KeyboardEvent.ctrlKey](https://mdn.io/KeyboardEvent.ctrlKey)',
        },
    },
    {
        label: 'shift',
        kind: CompletionItemKind.EnumMember,
        detail: 'EventDescriptorModifiers.shift',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
                'Invoke this event only when the `shift` was pressed.\n\nSee [KeyboardEvent.shiftKey](https://mdn.io/KeyboardEvent.shiftKey)',
        },
    },
    {
        label: 'meta',
        kind: CompletionItemKind.EnumMember,
        detail: 'EventDescriptorModifiers.meta',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
                'Invoke this event only when the `meta` key (`⌘ Command` key on Mac keyboards, or the Windows key (`⊞`)) was pressed.\n\nSee [KeyboardEvent.metaKey](https://mdn.io/KeyboardEvent.metaKey)\n\n> At least as of Firefox 48, the `⊞` Windows key is no longer considered the "Meta" key.',
        },
    },
])
export const HTMLEventDescriptorMethods: ReadonlySet<CompletionItem> = new Set([
    {
        label: 'prevent',
        kind: CompletionItemKind.Method,
        detail: 'EventDescriptorMethods.preventDefault()',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
                'If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled.\n\nSee [Event.preventDefault](https://mdn.io/Event.preventDefault)',
        },
    },
    {
        label: 'stop',
        kind: CompletionItemKind.Method,
        detail: 'EventDescriptorMethods.stopPropagation()',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
                'When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object.\n\nSee [Event.preventDefault](https://mdn.io/Event.stopPropagation)',
        },
    },
    {
        label: 'stopImmediate',
        kind: CompletionItemKind.Method,
        detail: 'EventDescriptorMethods.stopImmediate()',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
                'Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.\n\nSee [Event.preventDefault](https://mdn.io/Event.stopImmediate)',
        },
    },
])
