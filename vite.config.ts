import { DAYS, epochTime } from './source/function/epoch-time';
import { version } from './package.json';
import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import process from "node:process";
import path from "node:path";

/** @see: https://vite.dev/config */
export default defineConfig({
    base: process.env.BASE_PATH || '/',
    build: {
        chunkSizeWarningLimit: 1024,
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
    define: {
        __BANQ_PACKAGE_VERSION__: JSON.stringify(version),
        __BANQ_SESSION_VERSION__: epochTime(DAYS)
    },
    resolve: {
        alias: {
            "@/assets": path.resolve(__dirname, "./assets"),
            "@/app-version": path.resolve(__dirname, "./source/app-version"),
            "@/blockchain": path.resolve(__dirname, "./source/blockchain"),
            "@/component": path.resolve(__dirname, "./source/component"),
            "@/constant": path.resolve(__dirname, "./source/constant"),
            "@/contract": path.resolve(__dirname, "./source/contract"),
            "@/function": path.resolve(__dirname, "./source/function"),
            "@/image": path.resolve(__dirname, "./source/image"),
            "@/page": path.resolve(__dirname, "./source/page"),
            "@/react": path.resolve(__dirname, "./source/react"),
            "@/type": path.resolve(__dirname, "./source/type"),
            "@/url": path.resolve(__dirname, "./source/url"),
            "@/zustand": path.resolve(__dirname, "./source/zustand"),
            "@/": path.resolve(__dirname, "./source"),
        },
    },
    envPrefix: "BANQ_",
    plugins: [react()],
});
