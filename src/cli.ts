import * as fs from 'fs'
import * as yargs from 'yargs'
import { green } from 'colors'
import { sh, mRequire } from './utils'
import IMod from './index'

const KEYWORDS = ['run', 'build', 'dev']

/* tslint:disable no-unused-expression */
yargs
  .usage('$0 <cmd> [args]')
  .command('run', '[run scripts]', () => {
    const subCmd = process.argv[3]
    if (!subCmd) return
    sh(`npm run ${subCmd}`)
  })
  .command('dev', '[watching mod]', () => {
    new IMod({ cwd: process.cwd() }).dev()
  })
  .command('build', '[build mod]', () => {
    new IMod({ cwd: process.cwd() }).build()
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
