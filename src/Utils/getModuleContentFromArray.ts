export function getModuleContentFromArray(list: string[], exportKey: string = '', mapKey: (modulePath: string) => string = (modulePath: string) => modulePath): string {
    let modules: string = ''
    let exports: string = ''
    for (let i: number = 0, len: number = list.length; i < len; i++) {
        const path: string = list[i]
        const name: string = `M${i}`
        if (exportKey === '*') {
            modules += `import * as ${name} from '${path}'\n`
        }
        else {
            modules += `import { ${exportKey} as ${name} } from '${path}'\n`
        }
        exports += `    '${mapKey(path)}': ${name},\n`
    }

    modules += '\n'
    exports = 'export default {\n' + exports
    exports += '}'

    return modules + exports
}