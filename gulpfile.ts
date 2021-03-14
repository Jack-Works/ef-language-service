import del from 'del'
import { exec } from 'child_process'
import { series, parallel } from 'gulp'
import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'
export default series(parallel(clean, tsc), parallel(build_vscode))

const dist = join(__dirname, '/dist')
function dir() {
    if (existsSync(dist)) return
    mkdirSync(dist)
}
export async function clean() {
    return del(dist)
}
export function tsc() {
    return exec('npx tsc -b . ', { cwd: __dirname })
}
export function build_vscode() {
    dir()
    return exec('npm run build', { cwd: join(__dirname, './extension-vscode/') })
}
