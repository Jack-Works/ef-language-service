# Core compiler (./parser)

[Kanban for compiler](https://github.com/Jack-Works/ef-language-service/projects/2)

-   ✅ Scanner: scan the text to spilt them into tokens
-   ✅ Parser: parse tokens into AST node
-   [Diagnostics](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#diagnostic)
    -   ✅ Parser error
    -   🔜 Semantic error
    -   🔜 Forward HTML & CSS diagnostics

# Language service (./language-service)

[Kanban for language service](https://github.com/Jack-Works/ef-language-service/projects/1)

## Work alone (not linked with TypeScript)

-   ✅ [Semantic tokens](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_semanticTokens): Provide semantic-aware tokens for code highlighting
-   ✅ [Folding range](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_foldingRange)
-   ✅ [Code completion](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_completion)
-   🔜 [Full formatting](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_formatting)
    -   🔜 [Partial formatting](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_rangeFormatting)
    -   🔜 [On type formatting](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_onTypeFormatting)
-   🔜 [Rename](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_rename)
    -   🔜 [Prepare rename](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_prepareRename)
    -   🔜 Rename tags, attributes, properties (single-change)
-   🔜 [Hover](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_hover)
    -   🔜 Delegate HTML and CSS
-   🔜 [Code actions](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_codeAction)
    I guess it will have use cases but I have no idea.
-   🔜 [Document symbols](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_documentSymbol): Provide all mounting points
-   🔜 [Inline hint](https://github.com/microsoft/language-server-protocol/issues/956): Provide inline hint for keycode in event declaration.

## Work with TypeScript language service

I have no confidence I can complete this section. It involves cross-language knowledge.

-   🔜 Goto...

    -   [Goto declaration](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_declaration)
    -   [Goto definition](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_definition)
    -   [Goto type definition](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_typeDefinition)
    -   [Goto implementation](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_implementation)
    -   [Find references](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_references)
        -   🔜 {{ }} expressions to TypeScript
        -   🔜 Find reference for mounting point & reference?

-   🔜 Contribute reference to TS LS
-   🔜 Rename mounting point & tag reference
-   🔜 Code completion in the {{ }} expression
-   🔜 Diagnostics in the {{ }} expression

## Not going to be implemented

No use cases for those features, RFC.

-   🚫 [Selection range](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_selectionRange): I don't understand what it is.
-   🚫 [Document highlight](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_documentHighlight): There is nothing to be created and referenced in the language.
-   🚫 [Document links](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_documentLink): No external linking like `-[./another.efml]` in the language
-   🚫 [Code lens](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_codeLens): Maybe add it once we have cross-language referencing
-   🚫 [Document color](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_documentColor) and [Color representation](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_colorPresentation): though we can do it for CSS in style attribute, but should we?
-   🚫 [Call Hierarchy](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_prepareCallHierarchy): This language has no function to be called.
-   🚫 [Linked editing range](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_linkedEditingRange): Same reason as document highlight.
-   🚫 [moniker](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_moniker): Need to learn more about lsp.
