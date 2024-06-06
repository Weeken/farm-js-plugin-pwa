// import { readFileSync } from 'node:fs';
import type { JsPlugin, UserConfig, Resource } from "@farmfe/core";
import { sw_template } from "./sw.js";

interface Options {
  /* Your options here */
  /**
   * 作用域
   */
  scope?: string;
  /**
   * SW 名
   */
  swName?: string;
  /**
   * 缓存名
   */
  cacheName?: string | number;
  /**
   * 初始缓存文件
   */
  staticFiles?: string[];
  /**
   * 缓存请求正则
   */
  patten?: RegExp;
}

const defaultOptions: Options = {
  scope: "",
  swName: "sw",
  staticFiles: [],
  cacheName: "sw-cache",
  patten: /(.html|.js|.mjs|.css|.png|.jpg|.jpeg|.svg|.webp|.svga)$/,
};

export default function farmPlugin(options: Options): JsPlugin {
  let farmConfig: UserConfig;

  const resolveOptions: Options = { ...defaultOptions, ...options };

  return {
    name: "farm-js-plugin-pwa",
    priority: -9990,
    configResolved(resolvedConfig) {
      // get resolved config
      farmConfig = resolvedConfig;
    },
    load: {
      filters: {
        resolvedPaths: [`${resolveOptions.swName}.js`],
      },
      executor(param) {
        if (param.resolvedPath === `${resolveOptions.swName}.js`) {
          return {
            content: sw_template(
              JSON.stringify(resolveOptions.cacheName),
              JSON.stringify(resolveOptions.staticFiles),
              resolveOptions.patten
            ),
            moduleType: "js",
          };
        }
      },
    },
    finalizeResources: {
      executor({ config, resourcesMap }) {
        const publicPath = config.output.publicPath;
        resolveOptions.staticFiles = [
          ...resolveOptions.staticFiles,
          ...Object.keys(resourcesMap)
            .filter((name) => !name.startsWith(`FARM_RUNTIME_`))
            .map((name) => `${publicPath}${name}`),
        ];
        const swResource: Resource = {
          name: `${resolveOptions.swName}.js`,
          bytes: [
            ...Buffer.from(
              sw_template(
                JSON.stringify(resolveOptions.cacheName),
                JSON.stringify(resolveOptions.staticFiles),
                resolveOptions.patten
              )
            ),
          ],
          emitted: false,
          resourceType: "js",
          origin: {
            type: "ResourcePot",
            value: "",
          },
        };
        resourcesMap[`${resolveOptions.swName}.js`] = swResource;

        return resourcesMap;
      },
    },
    transformHtml: {
      order: 2,
      async executor({ htmlResource }) {
        const htmlCode = Buffer.from(htmlResource.bytes).toString();
        const scope = resolveOptions.scope;
        const swName = resolveOptions.swName;
        const publicPath = farmConfig.compilation.output.publicPath;
        const newHtmlCode = `
        ${htmlCode}
        <script>
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker
                .register('${
                  publicPath ? `${publicPath}` : ""
                }${swName}.js'${`,{ scope: '${scope ? scope : publicPath}' }`})
                .then(function() {
                  console.log('ServiceWorker registered.');
                })
                .catch(function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
            });
          }
        </script>`;
        htmlResource.bytes = [...Buffer.from(newHtmlCode)];
        return htmlResource;
      },
    },
  };
}
