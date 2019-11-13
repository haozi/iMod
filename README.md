# iMod


---

## 1. Install

```bash
yarn global add imod
# or
sudo npm install imod -g
```

## 2. Showcase

### create a new project:
```bash
imod init ./hello
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
```typescript
import Imod from 'imod'
const iMod = new IMod({
  cwd: __dirname + '/../..'
})

iMod.build()
iMod.dev()
```

### create an example:

```bash
imod init ./hello --templateName=module --lite=true # If you don't use '--lite', it will try to install node_modules
```

## 3. Advanced configuration

* you can add a config at `package.json`, `./imod.config.js`, `./imod.config.json`, `./imodconfig.js`, `./imodconfig.json`
* The order in which imod looks up is `./imod.config.js` -> `./imod.config.json` -> `imodconfig.js` -> `imodconfig.json` -> `${package.json}.config.imod`


this is the default configuration:

```javascript
{
  "name": moduleName, // if not set, will guess from ${package.json}.name
  "banner": "", // if not set, return ''
  "compilerOptions": [
    {
      "format": "esm",
      "extName": ".mjs",
      "target": "esnext"
    },
    {
      "format": "cjs",
      "extName": ".js",
      "target": "es5"
    },
    {
      "format": "umd",
      "extName": ".min.js",
      "target": "es5"
    }
  ]
}
```
