# Core compiler (./parser)

-   ✅ Scanner: scan the text to spilt them into tokens
    -   🔜 Let `TextFragment` doesn't include trailing white spaces if there is no meaningful token in this line.
-   ✅ Parser: parse tokens into AST node
    -   🔜 Let `CommentLine` a `Line` (with endOfLineToken)
-   [Diagnostics](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#diagnostic)
    -   ✅ Parser error
    -   🔜 Semantic error
    -   🔜 Forward HTML & CSS diagnostics
-   🔜 Emitter: Emit from efml to HTML. Might not be useful for normal users but important in the LS

# Language service (./language-service)

-   ✅ [Semantic tokens](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_semanticTokens): Provide semantic-aware tokens for code highlighting
-   ✅ [Folding range](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_foldingRange)
-   🔜 [Inline hint](https://github.com/microsoft/language-server-protocol/issues/956): Provide inline hint for keycode in event declaration.
-   🔜 [Document links](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_documentLink): Provide link parse
-   🔜 [Full formatting](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_formatting)
    -   🔜 [Partial formatting](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_rangeFormatting)
    -   🔜 [On type formatting](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_onTypeFormatting)
-   🔜 [Rename](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_rename)
    -   🔜 [Prepare rename](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_prepareRename)
    -   🔜 Rename tags, attributes, properties (without forwarding to external world)...
    -   🔜 Rename reference
-   🔜 [Code completion](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_completion)
    -   🔜 Delegate to HTML and CSS
    -   🔜 Delegate exotic expressions to TypeScript
    -   🔜 Completion for event modifier
-   🔜 [Hover](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_hover)
    -   🔜 Delegate HTML and CSS
    -   🔜 Delegate exotic expressions to TypeScript
-   🔜 Goto...

    -   [Goto declaration](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_declaration)
    -   [Goto definition](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_definition)
    -   [Goto type definition](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_typeDefinition)
    -   [Goto implementation](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_implementation)
    -   [Find references](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_references)
        -   🔜 Delegate exotic expressions to TypeScript
        -   🔜 Find reference for mounting point?

-   🔜 [Code actions](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_codeAction)
    I guess it will have use cases but I have no idea.

## Not going to be implemented

No use cases for those features, RFC.

-   🚫 [Selection range](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_selectionRange): I don't understand what function it represents
-   🚫 [Document highlight](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_documentHighlight)
-   🚫 [Document symbols](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_documentSymbol)
-   🚫 [Code lens](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_codeLens)
-   🚫 [Document color](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_documentColor) and [Color representation](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_colorPresentation): though we can do it for CSS in style attribute, but should we?
-   🚫 [Call Hierarchy](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_prepareCallHierarchy): This language has no function to be called.
-   🚫 [Linked editing range](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_linkedEditingRange)
-   🚫 [moniker](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_moniker): Need to learn more about lsp.
