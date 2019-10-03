import * as path from 'path'
import * as fs from 'fs'
import { red, green } from 'colors'
import { sh, rimraf, mkdirp } from './utils'

interface IOptions {
  targetFolder: string
  templateName: string
  lite: boolean
}
const checkFolder = (targetFolder: string): boolean => {
  const exists = fs.existsSync(targetFolder)
  if (!exists) return true

  const stat = fs.lstatSync(targetFolder)
  if (stat.isFile()) return false
  if (stat.isDirectory()) {
    const d = fs.readdirSync(targetFolder)
    return !d.length
  }
  return false
}

export default async ({ templateName, targetFolder, lite }: IOptions) => {
  if (['mod', 'module', 'imod', 'demo'].includes(templateName)) {
    templateName = 'module'
  }
  if (!checkFolder(targetFolder)) {
    console.error(red(`It's not an empty directory: \`${targetFolder}\``))
    return
  }

  mkdirp.sync(targetFolder)
  process.chdir(targetFolder)
  const gitRepo = `https://github.com/haozi/imod-template-${templateName}.git ${targetFolder}`
  const shell = `git clone ${gitRepo} --depth 1`
  await sh(shell)
  rimraf.sync(path.resolve(targetFolder, '.git'))
  console.log(green(`init scafolding succeed: \`${targetFolder}\``))
  if (!lite) {
    await sh('git init && git add .')
    await sh('yarn')
  }
}
