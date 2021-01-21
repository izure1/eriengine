import path from 'path'

export function getStorageKeyFromFilename(filePath: string): string {
    const { name } = path.parse(filePath)
    const keys: string[] = name.split('.')
    if (keys.length < 2) {
        return ''
    }
    return keys.pop()!
}