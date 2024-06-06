import type { JsPlugin } from "@farmfe/core";
interface Options {
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
export default function farmPlugin(options: Options): JsPlugin;
export {};
