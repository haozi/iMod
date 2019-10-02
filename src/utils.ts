import * as childProcess from 'child_process'
export const mRequire = (obj: any) => obj && obj.__esModule ? obj.default : obj
export const sh = (bash: string, { silent = false } = {}) => {
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
