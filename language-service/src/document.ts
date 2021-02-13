import { parseSourceFile } from 'ef-parser'
import { Range, TextDocument, TextDocumentContentChangeEvent } from 'vscode-languageserver-textdocument'

export class EFDocument {
    constructor(public uri: string, public languageId: string, public text: TextDocument) {}
    getText(range?: Range) {
        return this.text.getText(range)
    }
    positionAt(pos: number) {
        return this.text.positionAt(pos)
    }
    public ast = parseSourceFile(this.text.getText(), this.text.uri)
    static create(uri: string, languageId: string, version: number, content: string): EFDocument {
        return new EFDocument(uri, languageId, TextDocument.create(uri, languageId, version, content))
    }
    static update(document: EFDocument, changes: TextDocumentContentChangeEvent[], version: number): EFDocument {
        TextDocument.update(document.text, changes, version)
        document.ast = parseSourceFile(document.text.getText(), document.text.uri)
        return document
    }
}
