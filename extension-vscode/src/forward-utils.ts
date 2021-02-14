import { Uri, workspace } from 'vscode'

const virtualDocumentContents = new Map<string, string>()
workspace.registerTextDocumentContentProvider('ef-embedded', {
    provideTextDocumentContent: (uri) => virtualDocumentContents.get(uri.path),
})

export function createNewVirtualFile(extension: string, content: string) {
    const rand = '' + Math.random()
    const url = `ef-embedded://${extension}/${rand}.${extension}`
    const uri = Uri.parse(url)
    virtualDocumentContents.set(`/${rand}.${extension}`, content)
    return [uri, () => virtualDocumentContents.delete(url)] as const
}
