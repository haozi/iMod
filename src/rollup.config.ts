import * as _typescript2 from 'rollup-plugin-typescript2'
const typescript2: any = _typescript2
interface IOptions {
  input: string
  format: 'esm' | 'cjs' | 'amd' | 'commonjs' | 'es' | 'iife' | 'module' | 'system' | 'umd' | undefined
  target: string
  output: string
  banner: string
  name: string
}
export default ({ input, format, target, output, banner, name }: IOptions) => {
  // acorn, acornInjectPlugins, cache, chunkGroupingSize, context, experimentalCacheExpiry, experimentalOptimizeChunks, experimentalTopLevelAwait, external, inlineDynamicImports, input, manualChunks, moduleContext, onwarn, perf, plugins, preserveModules, preserveSymlinks, shimMissingExports, strictDeprecations, treeshake, watch
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
              declaration: true,
              declarationDir: './dist/types',
              module: 'esnext',
              target
            }
          },
          useTsconfigDeclarationDir: true
        })
      ]
    },
    outputOptions: {
      name,
      banner,
      file: output,
      format
    }
  }
}
