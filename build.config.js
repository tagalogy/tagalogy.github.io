import typescript from 'rollup-plugin-typescript2';
import {terser} from "rollup-plugin-terser";

export default {
    input: "src/main.ts",
    output: {
        file: "public/dist/main.js",
        format: "iife",
        name: "main",
    },
    plugins: [
        typescript(),
        terser({
            output: {
                comments: false,
                ecma: "2015",
            },
        }),
    ],
};