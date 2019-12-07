import * as path from 'path'
import { mRequire, safeVariableName } from './utils'
import * as jsonuri from 'jsonuri'
export interface IConfig {
  input?: string | string[]
  outDir: string
  banner: string
  verbose: boolean // 是否显示冗长日志
  name?: string
  declarationDir?: string | null | false // types 目录
  compilerOptions: {
    format: 'esm' | 'cjs'
    extName: '.mjs' | '.js'
    target: 'exnext' | 'es5'
  }[]
}
export default (cwd: string) => {
  // 寻找顺序：imod.config.js -> imod.config.json -> imodconfig.js -> imodconfig.json -> ${package.json}.config.imod
  const pkg = require(path.resolve(cwd, 'package.json'))
  const defaultConfig = {
    name: safeVariableName(pkg.name),
    banner: '',
    outDir: 'dist',
    compilerOptions: [
      {
        format: 'esm',
        extName: '.mjs',
        target: 'esnext'
      },
      {
        format: 'cjs',
        extName: '.js',
        target: 'es5'
      },
      {
        format: 'umd',
        extName: '.min.js',
        target: 'es5'
      }
    ]
  }
  const configList = [
    path.resolve(cwd, 'imod.config.js'),
    path.resolve(cwd, 'imod.config.json'),
    path.resolve(cwd, 'imodconfig.js'),
    path.resolve(cwd, 'imodconfig.json')
  ]
  let config!: IConfig
  for (let path of configList) {
    try {
      config = mRequire(require(path))
      if (config) break
    } catch {/* */}
  }

  if (!config) {
    config = jsonuri.get(pkg, 'config/imod') || jsonuri.get(pkg, 'config/iMod') || jsonuri.get(pkg, 'imod') || jsonuri.get(pkg, 'iMod') || {}
  }

  config = {
    ...defaultConfig,
    ...config
  }
  return config
}
