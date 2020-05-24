import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";

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
