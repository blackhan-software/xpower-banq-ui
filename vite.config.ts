/// <reference types="vitest/config" />
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
        chunkSizeWarningLimit: 4096,
    },
    define: {
        __BANQ_PACKAGE_VERSION__: JSON.stringify(version),
        __BANQ_SESSION_VERSION__: epochTime(DAYS)
    },
    resolve: {
        alias: {
            "@/assets": path.resolve(__dirname, "./assets"),
            "@/app-theme": path.resolve(__dirname, "./source/app-theme"),
            "@/app-version": path.resolve(__dirname, "./source/app-version"),
            "@/blockchain": path.resolve(__dirname, "./source/blockchain"),
            "@/component": path.resolve(__dirname, "./source/component"),
            "@/constant": path.resolve(__dirname, "./source/constant"),
            "@/contract": path.resolve(__dirname, "./source/contract"),
            "@/function": path.resolve(__dirname, "./source/function"),
            "@/image": path.resolve(__dirname, "./source/image"),
            "@/page": path.resolve(__dirname, "./source/page"),
            "@/react": path.resolve(__dirname, "./source/react"),
            "@/test": path.resolve(__dirname, "./test"),
            "@/type": path.resolve(__dirname, "./source/type"),
            "@/url": path.resolve(__dirname, "./source/url"),
            "@/zustand": path.resolve(__dirname, "./source/zustand"),
            "@/": path.resolve(__dirname, "./source"),
        },
    },
    server: {
        allowedHosts: ["www.xpowerbanq.com"],
        host: "0.0.0.0",
        port: 5173,
    },
    test: {
        coverage: {
            provider: "v8",
            include: ["source/**"],
            exclude: ["source/**/*.test.{ts,tsx}", "source/**/*.scss"],
            reporter: ["text", "lcov"],
            thresholds: {
                lines: 60, functions: 60, branches: 60, statements: 60,
            },
        },
    },
    envPrefix: "BANQ_",
    plugins: [react()],
});
