import * as yargs from 'yargs'
import * as path from 'path'
import { green, yellow } from 'colors'
import { mRequire } from './utils'
import IMod from './index'
import initTemplate from './initTemplate'
import * as updater from 'npm-updater'
import * as pkg from '../package.json'

const KEYWORDS = ['run', 'build', 'dev', 'init']

// check version
updater({
  package: pkg,
  abort: false,
  interval: '1d',
  registry: 'https://registry.npm.taobao.org',
  updateMessage: yellow(`\nplease run \`yarn global add ${pkg['name']}@latest\` to update\n`)
})

/* tslint:disable no-unused-expression */
yargs
  .usage('$0 <cmd> [args]')
  .command('dev', '[watching mod]', () => {
    const { verbose = false } = yargs.argv
    new IMod({ cwd: process.cwd(), verbose }).dev()
  })
  .command('build', '[build mod]', () => {
    const { verbose = false } = yargs.argv
    new IMod({ cwd: process.cwd(), verbose }).build()
  })
  // imod init . --templateName=module --lite=true
  .command('init', '[init a demo: e.g: `imod init .`]', () => {
    yargs
      .alias('m', 'templateName')
      .alias('l', 'lite')
    const cwd = process.cwd()
    let { lite = false, templateName = false } = yargs.argv
    let [targetFolder = '.'] = yargs.argv._.slice(1)
    templateName = typeof templateName === 'boolean' ? 'module' : templateName
    targetFolder = path.resolve(cwd, targetFolder + '')
    initTemplate({ templateName, targetFolder, lite })
    // console.log(templateName, targetFolder, lite)
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
  let logo = '  _ __  __           _\n (_)  \\/  |         | |\n  _| \\  / | ___   __| |\n | | |\\/| |/ _ \\ / _` |\n | | |  | | (_) | (_| |\n |_|_|  |_|\\___/ \\__,_|'
  logo += ` @${pkg['version']}` + '\n'
  console.log(green(logo))
  console.log(yargs.getUsageInstance().help())
}
