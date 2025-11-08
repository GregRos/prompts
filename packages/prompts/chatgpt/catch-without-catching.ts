// The following code gets the last exception without catching it
// On V8 at least
const prepareStack = "prepareStackTrace"

export class PrepareStackTraceManager {
    _prev: PropertyDescriptor | undefined
    _cur: PropertyDescriptor | undefined
    _desynced: boolean = false
    constructor() {}

    private _getDescriptor() {
        return Object.getOwnPropertyDescriptor(Error, prepareStack)
    }

    private _defineProperty(desc: PropertyDescriptor) {
        Object.defineProperty(Error, prepareStack, desc)
    }

    private _setDescriptor(callback: (err: Error) => void) {
        this._cur = {
            enumerable: false,
            configurable: true,
            writable: true,
            value: (err: Error, structuredStackTrace: NodeJS.CallSite[]) => {
                callback(err)
                const origFunction =
                    this._prev?.value ?? this._prev?.get?.call(Error)
                if (this._prev) {
                    return origFunction.call(Error, err, structuredStackTrace)
                }
                return structuredStackTrace
            }
        }
        this._defineProperty(this._cur)
    }

    private _restoreDescriptor() {
        // first check the current descriptor is ours
        const descriptor = this._getDescriptor()
        if (descriptor?.value !== this._cur?.value) {
            // If the descriptor is not the one we set, we can't restore it
            console.warn(
                "Doddle: prepareStackTrace modified during execution. Can't restore it."
            )
            this._desynced = true
            return false
        }
        if (this._prev) {
            // restore the old one
            this._defineProperty(this._prev)
            this._prev = undefined
        } else {
            // If we didn't have an old descriptor
            delete Error[prepareStack]
        }
    }
}

function getDescriptor() {
    return Object.getOwnPropertyDescriptor(Error, prepareStack)
}
function setDescriptor(callback: (err: Error) => void) {
    Object.defineProperty(Error, prepareStack, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: (err: Error, structuredStackTrace: NodeJS.CallSite[]) => {
            lastError = err
            const origFunction =
                descriptor?.value || descriptor?.get?.call(Error)
            if (descriptor) {
                return origFunction.call(Error, err, structuredStackTrace)
            }
            return structuredStackTrace
        }
    })
}
function unsetDescriptor() {}
function run(exec: () => void) {
    // we don't want to cause an exception by doing this, so let's check it's possible
    const descriptor = getDescriptor()
    if (descriptor?.configurable === false) {
        return false
    }
    let lastError: Error | undefined

    return {
        close() {
            const descriptor = getDescriptor()
        }
    }
}
