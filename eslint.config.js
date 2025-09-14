import eslintConfigPrettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

export default [
  // disable rules that conflict with Prettier
  eslintConfigPrettier,

  // basic project-level settings
  {
    ignores: ["node_modules/**"],
  },

  // language options and rules
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "no-console": "off",
      "prettier/prettier": "warn",
    },
  },
];
