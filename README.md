## farm-js-plugin-pwa

A pwa js plugin for farm

### Install

```bash
pnpm add -D farm-js-plugin-pwa
```

### Usage

```ts
import { defineConfig } from "@farmfe/core";
import farmJsPluginPwa from "farm-js-plugin-pwa";

interface Options {
  /* Your options here */
  /**
   * scope of sw cache
   */
  scope?: string; // default: publicPath of the farm config
  /**
   * name of the sw.js
   */
  swName?: string; // default: 'sw'
  /**
   * name of sw cache
   */
  cacheName?: string; // default: 'sw-cache'
  /**
   * custom cache files
   */
  staticFiles?: string[]; // ['/favicon.ico']
  /**
   * request url reg
   */
  patten?: RegExp; // default:  /(.html|.js|.mjs|.css|.png|.jpg|.jpeg|.svg|.webp|.svga)$/
}

export default defineConfig({
  plugins: [farmJsPluginPwa({})],
});
```
