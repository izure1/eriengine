interface ModuleMap {
    path: string
    name: string
}

export function mappingDefaultExport(moduleDatas: ModuleMap[]): string {
    let content: string = ''
    for (const { name, path } of moduleDatas) {
        content += `    '${path}': ${name},\n`
    }

    content = 'export default {\n' + content
    content += '}'

    return content
}

export function getModuleContentFromArray(list: string[], exportKey: string = '', mappingExport: (moduleDatas: ModuleMap[]) => string = mappingDefaultExport): string {
    let modules: string = ''
    const maps: ModuleMap[] = []
    for (let i: number = 0, len: number = list.length; i < len; i++) {
        const path: string = list[i]
        const name: string = `M${i}`
        if (exportKey === '') {
            modules += `import ${name} from '${path}'\n`
        }
        else if (exportKey === '*') {
            modules += `import * as ${name} from '${path}'\n`
        }
        else {
            modules += `import { ${exportKey} as ${name} } from '${path}'\n`
        }
        maps.push({ name, path })
    }

    modules += '\n'
    modules += mappingExport(maps)

    return modules
}