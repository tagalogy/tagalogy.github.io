import typescript from 'rollup-plugin-typescript2';

export default {
    input: "src/main.ts",
    output: {
        file: "public/dist/main.js",
        format: "iife",
        name: "main",
        sourcemap: "inline",
    },
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    sourceMap: true,
                },
            },
        }),
    ],
    watch: {
        include: "src/**",
    },
};