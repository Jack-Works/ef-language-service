const input = document.querySelector('input')
const source = document.querySelector('textarea')
source.focus()
source.addEventListener('blur', () => source.focus())
input.addEventListener('change', () => {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
        const x = JSON.parse(e.target.result)
        source.value = x.text
        document.getElementById('root').tree = x
    }
    reader.readAsText(file)
})
/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {HTMLElement} parent
 * @param {T} tagName
 * @returns {HTMLElementTagNameMap[T]}
 */
function h(parent, tagName) {
    return parent.appendChild(document.createElement(tagName))
}
class ASTTree extends HTMLElement {
    get pos() {
        const { pos, end, line, character, len } = this.tree
        let str = ''
        if (pos !== undefined) str += `${pos}-${end}; `
        if (line !== undefined) str += `L${line + 1}:${character}, length ${len}`
        if (!str) return ` (No position)`
        return ` (Position: ${str})`
    }
    attachFocus() {
        this.addEventListener('mousemove', (e) => {
            e.stopPropagation()
            source.setSelectionRange(this.tree.pos, this.tree.end)
            this.style.outline = '1px solid red'
        })
        this.addEventListener('mouseleave', (e) => {
            this.style.outline = 'none'
        })
    }
    /** @type {import('./src/types/ast').Node} */
    get tree() {
        return this._tree
    }
    set tree(node) {
        this._tree = node
        this.innerHTML = '<details open><summary>' + node.__kind__ + this.pos + '</summary><ul>'
        if (typeof node.pos === 'number') this.attachFocus()
        const ul = this.querySelector('ul')
        for (const key in node) {
            const item = node[key]
            if (['kind', '__kind__', 'pos', 'end', 'line', 'character', 'len', 'text'].includes(key)) continue
            const li = h(ul, 'li')
            li.append(key + ': ')
            if (item.kind) {
                h(li, 'ast-tree').tree = item
            } else if (Array.isArray(item) && item[0]?.kind) {
                h(li, 'ast-trees').tree = item
            } else {
                li.append(JSON.stringify(item))
            }
        }
    }
}
class ASTTreeNodeArray extends HTMLElement {
    /** @type {import('./src/types/ast').NodeArray<import('./src/types/ast').Node>} */
    get tree() {
        return this._tree
    }
    set tree(array) {
        if (array.length === 0) {
            this.innerText = 'Array<?> (empty)'
            return
        }
        if (array.length === 1) {
            const first = array[0]
            h(this, 'ast-tree').tree = { ...first, __kind__: 'NodeArray[0]: ' + first.__kind__ }
            return
        }
        const kinds = [...new Set(array.map((x) => x.__kind__))].join(' | ')
        this.innerHTML = '<details open><summary>NodeArray&lt;' + kinds + '&gt;</summary><ul>'
        const ul = this.querySelector('ul')
        for (const node of array) h(ul, 'ast-tree').tree = node
    }
}
customElements.define('ast-tree', ASTTree)
customElements.define('ast-trees', ASTTreeNodeArray)
