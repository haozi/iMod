import * as path from 'path'
import { mRequire } from './utils'
export interface IConfig {
  banner: string,
  compilerOptions: {
    format: 'esm' | 'cjs',
    extName: '.mjs' | '.js',
    target: 'exnext' | 'es5'
  }[]
}
export default (cwd: string) => {
  const defaultConfig = {
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
  // 寻找顺序：imodconfig.js -> imodconfig.json -> ${package.json}.config.imod
  let pkg = require(path.resolve(cwd, 'package.json'))
  let config!: IConfig
  const configList = [path.resolve(cwd, 'imodconfig.json'), path.resolve(cwd, 'imodconfig.js')]
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
