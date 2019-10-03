import * as path from 'path'
import { rollup, watch } from 'rollup'
import * as globy from 'globy'
import ora from 'ora'
import { red, green } from 'colors'
import * as updateNotifier from 'update-notifier'
import * as pkg from '../package.json'
import genRollupConfig from './rollup.config'
import getUserOptions, { IConfig } from './getUserOptions'
import { sh, parallelize, rimraf } from './utils'

updateNotifier({ pkg }).notify()

export default class IMod {
  cwd: string
  config: IConfig
  pkgJSON: any
  silent = false
  console !: Console
  iswatching = false
  static CACHE_PATH = './node_modules/.cache/imod'
  static EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs']
  static WATCH_OPTS = {
    clearScreen: true,
    exclude: 'node_modules/**'
  }
  constructor (config) {
    this.cwd = path.resolve(config.cwd)
    this.config = {
      ...getUserOptions(this.cwd),
      ...config,
      cwd: this.cwd
    }
    this.pkgJSON = require(`${this.cwd}/package.json`)
    this.console = console
  }

  build () {
    this.iswatching = false
    this._run()
  }

  dev () {
    this.iswatching = true
    this._run()
  }

  async _run () {
    const start = Date.now()
    process.chdir(this.cwd)
    this._clean()
    if (!this.config.verbose) {
      global.console = {} as Console
      Object.keys(this.console).forEach(type => {
        global.console[type] = (...args: any[]) => {
          if (this.silent) return
          this.console[type].apply(this.console, args)
        }
      })
    }

    const inputFiles: string[] = globy.glob(path.resolve(this.cwd, `src/index*{${IMod.EXTENSIONS.join(',')}}`))
    let task: Promise<void>[] = []
    for (let inputFile of inputFiles) {
      const fileName = path.basename(inputFile).replace(path.extname(inputFile), '')
      for (let { extName, format, target } of this.config.compilerOptions) {
        const outputFile = path.resolve(this.cwd, 'dist', `${fileName}${extName}`)
        task.push(this._rollup({ inputFile, outputFile, format, target }))
      }
    }
    await parallelize(task)
    this._clean()
    console.log(green(`total: ${Date.now() - start}ms`))
  }

  private async _rollup ({ inputFile, outputFile, format, target }) {
    this.silent = true
    const MSG = `compile ${this._relative(inputFile)} -> ${this._relative(outputFile)}`.padEnd(50, ' ')
    const spinner = ora(MSG)
    try {
      const { inputOptions, outputOptions } = genRollupConfig({
        input: inputFile,
        output: outputFile,
        format,
        target,
        banner: this.config.banner,
        name: this.config.name || ''
      })

      if (!this.iswatching) {
        spinner.start()
        const start = Date.now()
        const bundle = await rollup(inputOptions)
        await bundle.write(outputOptions)
        await this._format(outputFile, format)
        spinner.succeed(`${MSG} ${green(`${Date.now() - start}ms`)}`)
        this.silent = false
        return
      }

      const watchOptions: any = {
        ...inputOptions,
        output: outputOptions,
        watch: IMod.WATCH_OPTS
      }
      const watcher = watch(watchOptions)
      let start: number
      watcher.on('event', (e) => {
        switch (e.code) {
          case 'START':
            start = Date.now()
            spinner.start(MSG)
            break
          case 'BUNDLE_END':
            spinner.succeed(`${MSG} ${green(`${Date.now() - start}ms`)}`)
            break
          case 'ERROR':
            this.console.error(e.error.stack || e.error)
            spinner.fail(red(`${MSG} ${Date.now() - start}ms`))
        }
      })
    } catch (e) {
      this.console.error(e.stack)
      spinner.fail()
    } finally {
      if (!this.iswatching) {
        this.silent = false
      }
    }
  }

  private async _format (outputFile: string, _format: 'esm' | 'cjs') {
    // if (format !== 'esm') return
    const standard = path.resolve(__dirname, '../node_modules/.bin/standard')
    await sh(`${standard} ${outputFile} --fix`, { silent: !this.config.verbose })
  }
  private _relative (file: string) {
    return path.relative(this.cwd, file)
  }
  private _clean () {
    rimraf.sync(IMod.CACHE_PATH)
  }
}
