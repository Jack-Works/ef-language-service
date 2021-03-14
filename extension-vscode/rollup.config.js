import { resolve, join } from 'path'
import del from 'del'
import sucrase from '@rollup/plugin-sucrase'
import node from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { readFile } from 'fs/promises'
import { createVSIX } from 'vsce'

const out = resolve(__dirname, './temp/')
del.sync(out)

/** @type {import('rollup').RollupOptions} */
const conf = {
    input: {
        'dist/extension': resolve(__dirname, './src/extension.ts'),
        'node_modules/ef-language-service-server/dist/server': resolve(__dirname, '../language-service/src/server.ts'),
    },
    output: {
        dir: out,
        format: 'commonjs',
        manualChunks(id) {
            if (id.includes('rollup.patch')) return 'commonjs'
            if (id.includes('parser')) return 'ef-parser'
            if (id.includes('node_modules')) {
                const pkg = id.match(/\.pnpm.(.+)@.+/)
                return 'libs/' + pkg[1]
            }
        },
    },
    plugins: [
        node({ preferBuiltins: true }),
        commonjs(),
        sucrase({
            exclude: ['node_modules/**'],
            transforms: ['typescript'],
        }),
        {
            name: 'vsce',
            async buildEnd(err) {
                if (err) return
                {
                    // write package.json
                    const pkg = require('./package.json')
                    delete pkg.enableProposedApi
                    delete pkg.scripts
                    keptOnly(pkg.dependencies, ['ef-language-service-server'])
                    keptOnly(pkg.devDependencies, ['@types/vscode'])
                    this.emitFile({
                        type: 'asset',
                        fileName: 'package.json',
                        source: JSON.stringify(pkg, undefined, 2),
                    })
                }
                await copy.call(this, 'README.md')
                await copy.call(this, 'language-configuration.json')
            },
            async writeBundle() {
                const version = require('./package.json').version
                await createVSIX({ cwd: out, packagePath: join(__dirname, `../dist/vscode.${version}.vsix`) })
            },
        },
    ],
}
export default conf
async function copy(file) {
    this.emitFile({
        type: 'asset',
        fileName: file,
        source: await readFile(resolve(__dirname, './' + file)),
    })
}
function keptOnly(obj, keys) {
    for (const key in obj) {
        if (keys.includes(key)) continue
        delete obj[key]
    }
}
