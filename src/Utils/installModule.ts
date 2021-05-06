import { exec } from 'child_process'

export async function installModuleFromPackage(cwd: string): Promise<Engine.ModuleSystem.InstallSuccess|Engine.ModuleSystem.InstallFail> {
  return new Promise((resolve): void => {
    exec(`npm i`, { cwd }, (err, stdout, stderr): void => {
      if (stderr) console.error(stderr)
      if (stdout) console.log(stdout)
      if (err) {
        const { name, message } = err
        return resolve({
          success: false,
          name,
          message
        })
      }

      resolve({
        success: true,
        name: '모듈 설치 성공',
        message: stdout,
      })
    })
  })
}

export async function installModule(name: string, version: string, cwd: string): Promise<Engine.ModuleSystem.InstallSuccess|Engine.ModuleSystem.InstallFail> {
  return new Promise((resolve): void => {
    exec(`npm i ${name}@${version}`, { cwd }, (err, stdout, stderr): void => {
      if (stderr) console.error(stderr)
      if (stdout) console.log(stdout)
      if (err) {
        const { name, message } = err
        return resolve({
          success: false,
          name,
          message
        })
      }

      resolve({
        success: true,
        name: '모듈 설치 성공',
        message: stdout,
      })
    })
  })
}