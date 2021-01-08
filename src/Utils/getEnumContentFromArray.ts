export function getEnumContentFromArray(list: string[]): string {
    let content: string = ''
    content += 'enum List {'
    for (const item of list) {
        content += `\n  "${item}" = "${item}",`
    }
    content += '\n}'
    content += '\n\nexport default List'
    return content
}