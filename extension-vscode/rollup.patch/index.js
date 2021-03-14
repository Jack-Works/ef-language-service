// FYI, maybe you have confused about this.

// Motivation:
// I want to split each node_modules in it's own chunk.

// Problem:
// Rollup bundles "commonjsGlobal" "createCommonjsModule" and "getAugmentedNamespace"
// into the "vscode-languageclient/node" and shared with the language server.
// "vscode-languageclient/node" imports "vscode" and it is only available in the client not server.

// Solution:
// Make this file as the first commonjs module that includes a ESM file in the project.
// Then rollup will create the helper functions in this module.

module.exports.a = require('./utils').a
