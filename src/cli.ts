import * as fs from 'fs'
import * as yargs from 'yargs'
import * as path from 'path'
import { green } from 'colors'
import { sh, mRequire } from './utils'
import IMod from './index'
import initTemplate from './initTemplate'

const KEYWORDS = ['run', 'build', 'dev', 'init']

/* tslint:disable no-unused-expression */
yargs
  .usage('$0 <cmd> [args]')
  .command('run', '[run scripts]', () => {
    const subCmd = process.argv[3]
    if (!subCmd) return
    sh(`npm run ${subCmd}`)
  })
  .command('dev', '[watching mod]', (args) => {
    const { verbose = false } = args.argv
    new IMod({ cwd: process.cwd(), verbose }).dev()
  })
  .command('build', '[build mod]', (args) => {
    const { verbose = false } = args.argv
    new IMod({ cwd: process.cwd(), verbose }).build()
  })
  // imod init mod ./
  .command('init', '[init a demo: e.g: `imod init mod .`]', (args) => {
    const cwd = process.cwd()
    const { lite = false } = args.argv
    let [templateName = 'module', targetFolder = '.'] = args.argv._.slice(1)
    targetFolder = path.resolve(cwd, targetFolder)
    initTemplate({ templateName, targetFolder, lite })
  })
  .version()
  .alias('v', 'version')
  .help()
  .alias('h', 'help')
  .argv

const subCmd = (() => {
  let s = process.argv[2] || ''
  if (/^[a-z]+/.test(s)) return s

  return
})()

if (subCmd && !KEYWORDS.includes(subCmd)) {
  yargs.command(subCmd, 'subCmd', {}, async () => {
    try {
      const Module = mRequire(require(`moto-plugin-${subCmd}`))
      await new Module().run()
    } catch (e) {
      console.log(e.code)
    }
  }).argv
}

if (process.argv.length < 3) {
  console.log(green(fs.readFileSync(`${__dirname}/../logo`, 'utf8')))
  console.log((yargs as any).getUsageInstance().help())
}
