import fs from 'fs-extra'
import words from 'an-array-of-english-words'

function randomWord(): string {
    return words[Math.floor(Math.random() * words.length)]
}

function getCamel(word: string): string {
    const chars = word.split('')
    if (chars[0]) {
        chars[0] = chars[0].toUpperCase()
    }
    return chars.join('')
}

export function getRandomSentence(count: number = 2): string {
    const words = []
    for (let i = 0; i < count; i++) {
        words.push(randomWord())
    }
    return words.map(getCamel).join('')
}