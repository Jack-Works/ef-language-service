import * as path from 'path'
import { workspace, ExtensionContext } from 'vscode'
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node'
import type { ExtendedLanguageServiceProtocol } from 'ef-language-service-server'
import { forwardCompletion } from './forward-completion'
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

    client.onReady().then(extendedProtocol)
}

function extendedProtocol() {
    listen('requestCompletionFrom', forwardCompletion)
}
function listen<K extends keyof ExtendedLanguageServiceProtocol>(key: K, f: ExtendedLanguageServiceProtocol[K]) {
    client.onRequest(key, (e) => (f as any)(...e[0]))
}

export async function deactivate() {
    return client?.stop()
}
