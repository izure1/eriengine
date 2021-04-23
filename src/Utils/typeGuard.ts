export function isString(str: unknown): str is string {
    if (typeof str !== 'string') {
        return false
    }
    return true
}

export function isNumber(num: unknown): num is number {
    if (typeof num !== 'number') {
        return false
    }
    if (Number.isNaN(num)) {
        return false
    }
    if (isNaN(num)) {
        return false
    }
    return true
}

export function isElement(el: unknown): el is Element {
    if ( !(el instanceof Element) ) {
        return false
    }
    return true
}