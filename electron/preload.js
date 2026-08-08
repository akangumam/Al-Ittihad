const { contextBridge, ipcRenderer } = require('electron');

// contextBridge requires CommonJS or ESM? 
// Preload scripts usually run without `"type": "module"` unless specifically configured.
// But since the project is `"type": "module"`, require might be undefined if Electron forces ESM.
// Let's use standard ESM for preload as well, but electron preload has limited ESM support in older versions.
// However, modern Electron allows it. Actually, wait! Preload script in ESM is fully supported in Electron 28+.
// Let's use `import` just to be safe. But wait, `electron` preload is often CJS.
// In Electron, to use ESM preload, we need `--experimental-default-type=module` or `.mjs`.
// I will write standard commonjs inside `.cjs` to be 100% safe, or just use ESM syntax.
// Actually, `preload.js` will be processed. I'll just use commonjs style but inside `preload.cjs`, and update `main.js` to point to it.
