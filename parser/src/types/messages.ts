import { DiagnosticMessage as T, DiagnosticSeverity } from './diagnostics'

function error(code: number, message: string): T {
    return { severity: DiagnosticSeverity.Error, code, message }
}
export const DiagnosticMessages = {
    $1_expected: error(1, 'Token %1 expected.'),
    unexpected_$1: error(2, 'Unexpected token %1'),
    non_empty_string_expected: error(5, 'Non-empty string expected.'),
}
