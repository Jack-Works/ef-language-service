/// <reference path="./vscode.proposed.d.ts" />

import {
    CancellationToken,
    InlineHint,
    InlineHintsProvider,
    TextDocument,
    Range,
    InlineHintKind,
    Position,
} from 'vscode'
import { callExtendedProtocol } from './extension'

export class InlayHintsProvider implements InlineHintsProvider {
    constructor() {}
    async provideInlineHints(model: TextDocument, range: Range, token: CancellationToken): Promise<InlineHint[]> {
        const result = await callExtendedProtocol().onUnstableInlayHints({
            textDocument: { uri: model.uri.toString() },
        })

        return result.map((val) => {
            const pos = convertPosition(val.position)
            return new InlineHint(val.label, new Range(pos, pos), InlineHintKind.Other)
        })
    }
}

function convertPosition(pos: import('vscode-languageclient').Position): import('vscode').Position {
    return new Position(pos.line, pos.character)
}
