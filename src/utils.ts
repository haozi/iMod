import * as childProcess from 'child_process'
import * as rimraf from 'rimraf'
import * as mkdirp from 'mkdirp'
import * as fs from 'fs'
import camelCase from 'camelcase'

export { rimraf, mkdirp }
export const mRequire = (obj: any) => obj && obj.__esModule ? obj.default : obj
export const sh = (bash: string, { silent = false } = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const p = childProcess.exec(bash, (error) => {
      if (error && !silent) {
        reject(error)
        return
      }

      resolve()
    })

    !silent && p.stderr && p.stderr.pipe(process.stderr)
    !silent && p.stdout && p.stdout.pipe(process.stdout)
  })
}

export const parallelize = async <T>(task: Promise<T>[]) => {
  const ret = await Promise.all(task)
  return ret
}

export const serial = async <T>(task: Promise<T>[]) => {
  for (let t of task) {
    await t
  }
}

const removeScope = (name: string) => name.replace(/^@.*\//, '')

export const safeVariableName = (name: string) => {
  return camelCase(removeScope(name).toLowerCase().replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, ''))
}

export const saveJSON = (path: string, data: object) => {
  let json
  try {
    json = require(path)
  } catch {
    json = {}
  }
  json = { ...json, data }
  fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n', 'utf8')
}
