# iMod


---

## 1. Install

```bash
yarn global install imod
# or
sudo npm install imod -g
```

## 2. Showcase

### create a new project:
```bash
imod init mod ./hello
```

### with an existing project:

add these into [package.json](https://github.com/haozi/imod-template-module/blob/master/package.json#L7)

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
```

### with cli
```bash
imod dev
imod build
```

### with JavaScript
```typescriptimport Imod from 'imod'
const iMod = new IMod({
  cwd: __dirname + '/../..'
})

iMod.build()
iMod.dev()
```

### create an example:

```bash
imod init mod ./hello --lite # If you don't use '--lite', it will install node_modules
```

## 3. Advanced configuration

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
