import * as path from 'path'
import { mRequire, safeVariableName } from './utils'
export interface IConfig {
  banner: string
  verbose: boolean // 是否显示冗长日志
  name?: string
  compilerOptions: {
    format: 'esm' | 'cjs'
    extName: '.mjs' | '.js'
    target: 'exnext' | 'es5'
  }[]
}
export default (cwd: string) => {
  // 寻找顺序：imodconfig.js -> imodconfig.json -> ${package.json}.config.imod
  const pkg = require(path.resolve(cwd, 'package.json'))
  const defaultConfig = {
    name: safeVariableName(pkg.name),
    banner: '',
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
      }
    ]
  }
  const configList = [path.resolve(cwd, 'imodconfig.json'), path.resolve(cwd, 'imodconfig.js')]
  let config!: IConfig
  for (let path of configList) {
    try {
      config = mRequire(require(path))
    } catch {/* */}
  }
  if (!config) {
    try {
      config = pkg.config.imod
    } catch {/**/}
  }
  if (!config) {
    config = {} as IConfig
  }
  config = {
    ...defaultConfig,
    ...config
  }
  return config
}
