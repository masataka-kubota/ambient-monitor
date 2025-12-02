// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  globalIgnores([
    "dist/*",
    "/.expo",
    "node_modules",
    "expo-env.d.ts",
    "dist/*",
  ]),
  expoConfig,
  eslintPluginPrettierRecommended,

  // eslint-plugin-import
  {
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          warnOnUnassignedImports: true,
        },
      ],
    },
  },
]);
