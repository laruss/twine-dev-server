import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import * as tsPlugin from "@typescript-eslint/eslint-plugin";
import * as tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    files: ["src/**/*.ts"],
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: tsParser,
        parserOptions: {
            tsconfigRootDir: "./",
            project: ["./tsconfig.json"]
        },
    },
    plugins: {
        "@typescript-eslint": tsPlugin
    },
    rules: {
        "@typescript-eslint/no-unused-vars": "warn",
    }
}];
