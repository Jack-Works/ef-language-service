/** Compatible with ResponseError in vscode */
export class ResponseError<T> extends Error {
    constructor(public message: string, public data: T | undefined = undefined, public readonly code = -1) {
        super(message)
    }
    toJson() {
        return {
            code: this.code,
            message: this.message,
            data: this.data,
        }
    }
}
export const CommonErrors = {
    get documentNotFound() {
        return new ResponseError('Document not found', undefined, 1)
    },
    get requestCancelled() {
        return new ResponseError('Request cancelled', undefined, 2)
    },
}
