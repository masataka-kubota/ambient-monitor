import baseConfig from '@hono/eslint-config'
import eslintPluginImport from 'eslint-plugin-import'

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
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

  {
    ignores: ['node_modules', '/.wrangler', 'eslint.config.mjs'],
  },
]
