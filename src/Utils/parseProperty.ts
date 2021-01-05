export function parseProperty(template: string, property: Engine.Type.Json): string {
    return template.replace(/{{2}\s?(.*?)\s?}{2}/gmi, (match: string, word: keyof typeof property): string => {
        if (word in property) {
            return property[word]!.toString()
        }
        return match
    })
}