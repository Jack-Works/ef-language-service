import * as path from 'path'
import { workspace, ExtensionContext } from 'vscode'

import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node'

let client: LanguageClient
export function activate(context: ExtensionContext) {
    const serverModule = context.asAbsolutePath(
        path.join('node_modules', 'ef-language-service-server', 'dist', 'server.js'),
    )
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: { execArgv: ['--nolazy', '--inspect=29384'] },
        },
    }
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ language: 'efml' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/*'),
        },
    }
    client = new LanguageClient('ef.language.service', 'EF language service', serverOptions, clientOptions)
    client.start()
}

export async function deactivate() {
    return client?.stop()
}
