import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tsEslint from 'typescript-eslint'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

export default tsEslint.config(
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      'coverage/',
      'pnpm-lock.yaml',
      'tsup.config.ts',
      'eslint.config.mjs'
    ]
  },
  ...compat.extends('standard', 'plugin:@typescript-eslint/recommended', 'plugin:@cspell/recommended', 'prettier'),
  {
    plugins: {
      'import-helpers': compat.plugins('eslint-plugin-import-helpers')[0].plugins['import-helpers'],
      'no-relative-import-paths': noRelativeImportPaths
    },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, rootDir: 'src', prefix: '@' }
      ],
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'no-console': 'warn',
      'no-underscore-dangle': ['off'],
      'import/prefer-default-export': 'off',
      'import/named': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'space-before-function-paren': 'off',
      'max-params': ['warn', 4],
      '@cspell/spellchecker': 'warn',
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: [
            'module',
            '/^@/api/',
            '/^@/core/',
            '/^@/infra/',
            '/^@/main/',
            '/^@/tests/',
            ['parent', 'sibling', 'index']
          ],
          alphabetize: { order: 'asc', ignoreCase: true }
        }
      ]
    }
  },
  {
    files: ['src/tests/**/*.spec.ts'],
    rules: {
      'no-new': 'off'
    }
  }
)
