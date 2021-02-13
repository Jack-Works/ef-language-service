export type { Position, Range, DiagnosticRelatedInformation } from 'vscode-languageserver-types'
import type { DiagnosticRelatedInformation, Range } from 'vscode-languageserver-types'
export enum DiagnosticSeverity {
    Error = 1,
    Warning = 2,
    Information = 3,
    Hint = 4,
}
export interface Diagnostic {
    range: Range
    severity: DiagnosticSeverity
    code: number
    message: string
    relatedInformation?: DiagnosticRelatedInformation[]
    data?: unknown
}
export interface DiagnosticMessage {
    severity: DiagnosticSeverity
    code: number
    message: string
}
export function fillMessage(o: DiagnosticMessage, ...args: (string | number)[]) {
    return { ...o, message: o.message.replace('%1', String(args[0])) }
}
