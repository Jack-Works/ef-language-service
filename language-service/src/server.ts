import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
} from 'vscode-languageserver/node'
import { EFDocument } from './document'

import { enableSemanticToken } from './semantic-token'
import { enableDiagnostics } from './diagnostics'
import { enableFoldingRange } from './folding-range'
import { enableCodeCompletion } from './completion'

const connection = createConnection(ProposedFeatures.all)
const documents: TextDocuments<EFDocument> = new TextDocuments(EFDocument)

connection.onInitialize((params: InitializeParams) => {
    const { textDocument } = params.capabilities

    enableDiagnostics(connection, documents, textDocument?.publishDiagnostics)

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            semanticTokensProvider: enableSemanticToken(connection, documents, textDocument?.semanticTokens),
            foldingRangeProvider: enableFoldingRange(connection, documents, textDocument?.foldingRange),
            completionProvider: enableCodeCompletion(connection, documents, textDocument?.completion),
        },
    }
    return result
})

documents.listen(connection)
connection.listen()
