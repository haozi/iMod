# imod


---

## Install

```bash
yarn global install imod
# or
sudo npm install imod -g
```

* then add the scripts to your package.json:
```json
{
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/types/index.d.ts",
  "scripts": {
    "build": "imod build",
    "dev": "imod dev"
  }
}
````

## How to use

### with cli
```bash
imod dev
imod build
```

### with JavaScript
```typescriptimport Imod from 'imod'
const imod = new IMod({
  cwd: __dirname + '/../..'
})

imod.build()
imod.dev()
```

### create an example:

```bash
imod init mod ./hello --lite # If you don't use '--lite', it will install node_modules
```

## Advanced configuration

* you can add a config at `package.json` / `./imodconfig.js` -> `./imodconfig.json`
* The order in which imod looks up is `imodconfig.js` -> `imodconfig.json` -> `${package.json}.config.imod`

configuration:
```javaScript
module.exports = {
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
```
