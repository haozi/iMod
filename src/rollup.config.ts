import * as uglify from 'rollup-plugin-uglify-es'
import * as _typescript2 from 'rollup-plugin-typescript2'
import * as _replace from '@rollup/plugin-replace'
const typescript2: any = _typescript2
const replace: any = _replace
interface IOptions {
  input: string
  outDir: string
  format: 'esm' | 'cjs' | 'amd' | 'commonjs' | 'es' | 'iife' | 'module' | 'system' | 'umd' | undefined
  target: string
  output: string
  banner: string
  name: string
  declarationDir?: string | null | false
}
export default ({ input, format, target, output, banner, name, outDir, declarationDir }: IOptions) => {
  // acorn, acornInjectPlugins, cache, chunkGroupingSize, context, experimentalCacheExpiry, experimentalOptimizeChunks, experimentalTopLevelAwait, external, inlineDynamicImports, input, manualChunks, moduleContext, onwarn, perf, plugins, preserveModules, preserveSymlinks, shimMissingExports, strictDeprecations, treeshake, watch
  if (declarationDir === undefined) {
    declarationDir = `./${outDir}/typings`
  }
  declarationDir = declarationDir || ''
  return {
    inputOptions: {
      input,
      preserveSymlinks: true,
      plugins: [
        typescript2({
          cacheRoot: `./node_modules/.cache/imod/.rollup_cache_${format}`,
          typescript: require('typescript'),
          verbosity: 2,
          tsconfigOverride: {
            compilerOptions: {
              declaration: !!declarationDir,
              declarationDir,
              module: 'esnext',
              target
            }
          },
          useTsconfigDeclarationDir: true
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),

        format === 'umd' && uglify()
      ].filter(Boolean)
    },
    outputOptions: {
      name,
      banner,
      file: output,
      format
    }
  }
}
