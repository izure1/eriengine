import nodePath from 'path'
import normalize from 'normalize-path'

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

/**
 * ts2691 오류 수정을 위한 .ts 확장자를 제거한 경로를 반환합니다. .ts 파일이 아닐 경우 모든 경로를 반환합니다.
 * @param filePath 모듈 파일 경로입니다.
 * @returns 문자열을 반환합니다.
 */
function getRemovedTsExt(filePath: string): string {
    const parsed = nodePath.parse(filePath)
    const path = parsed.ext === '.ts' ?
        nodePath.join(parsed.dir, parsed.name) :
        nodePath.join(parsed.dir, parsed.base)
    
    return normalize(path)
}

export function getModuleContentFromArray(list: string[], exportKey: string = '', mappingExport: (moduleDatas: ModuleMap[]) => string = mappingDefaultExport): string {
    let modules: string = ''
    const maps: ModuleMap[] = []
    for (let i = 0, len = list.length; i < len; i++) {
        const name = `M${i}`
        const path = list[i]
    
        if (exportKey === '') {
            modules += `import ${name} from '${getRemovedTsExt(path)}'\n`
        }
        else if (exportKey === '*') {
            modules += `import * as ${name} from '${getRemovedTsExt(path)}'\n`
        }
        else {
            modules += `import { ${exportKey} as ${name} } from '${getRemovedTsExt(path)}'\n`
        }
        maps.push({ name, path })
    }

    modules += '\n'
    modules += mappingExport(maps)

    return modules
}