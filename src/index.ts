import * as fs from 'fs'
import * as path from 'path'
import { rollup, watch } from 'rollup'
import * as glob from 'glob'
import * as ora from 'ora'
import { red, green } from 'colors'
import genRollupConfig from './rollup.config'
import getUserOptions, { IConfig } from './getUserOptions'
import { parallelize, rimraf } from './utils'
import * as standard from 'standard'

export default class IMod {
  cwd: string
  config: IConfig
  pkgJSON: any
  silent = false
  console !: Console
  iswatching = false
  private static CACHE_PATH = './node_modules/.cache/imod'
  private static EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs']
  private static WATCH_OPTS = {
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
      try {
        global.console = {} as Console
        Object.keys(this.console).forEach(type => {
          try {
            global.console[type] = (...args: any[]) => {
              if (this.silent) return
              this.console[type].apply(this.console, args)
            }
          } catch {
            // TypeError: Cannot set property console of #<Object> which has only a getter
          }
        })
      } catch {
        // TypeError: Cannot set property console of #<Object> which has only a getter
      }
    }

    let inputFiles: any = this.config.input
    if (!Array.isArray(inputFiles)) inputFiles = [inputFiles]
    inputFiles = inputFiles.filter(input => input && typeof input === 'string')

    if (inputFiles.length) {
      inputFiles = inputFiles.map(input => path.resolve(this.cwd, input))
    } else {
      inputFiles = glob.sync(path.resolve(this.cwd, `src/index*{${IMod.EXTENSIONS.join(',')}}`))
    }

    let task: Promise<void>[] = []
    for (let inputFile of inputFiles) {
      const fileName = path.basename(inputFile).replace(path.extname(inputFile), '')
      for (let { extName, format, target } of this.config.compilerOptions) {
        const outputFile = path.resolve(this.cwd, this.config.outDir, `${fileName}${extName}`)
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
        name: this.config.name || '',
        outDir: this.config.outDir,
        declarationDir: this.config.declarationDir
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
      // rimraf.sync(outputFile)
    } finally {
      if (!this.iswatching) {
        this.silent = false
      }
    }
  }

  private async _format (outputFile: string, format: 'esm' | 'cjs') {
    if (format !== 'esm') return
    try {
      let code = fs.readFileSync(outputFile, 'utf8')
      const standardLint = standard.lintTextSync(code, { fix: true })
      code = standardLint.results[0].output
      fs.writeFileSync(outputFile, code, 'utf8')
    } catch { /* noop */ }
  }
  private _relative (file: string) {
    return path.relative(this.cwd, file)
  }
  private _clean () {
    rimraf.sync(IMod.CACHE_PATH)
  }
}
