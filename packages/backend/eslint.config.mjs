import baseConfig from '@hono/eslint-config'
import eslintPluginImport from 'eslint-plugin-import'
import drizzle from 'eslint-plugin-drizzle'

export default [
  ...baseConfig,

  // TypeScript project settings
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Import order rules
  {
    ignores: ['node_modules', '/.wrangler'],
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['external', 'builtin', 'internal'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
          warnOnUnassignedImports: true,
        },
      ],
    },
  },

  // Drizzle safety rules
  {
    plugins: {
      drizzle,
    },
    rules: {
      ...drizzle.configs.recommended.rules,
    },
  },

  // Global ignores
  {
    ignores: ['node_modules', '/.wrangler', 'eslint.config.mjs'],
  },
]
