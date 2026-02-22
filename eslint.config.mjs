import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'app',
    typescript: true,
    ignores: [
      'node_modules',
      'frontend/**',
      'vibe/**',
      'AGENTS.md',
      'CLAUDE.md',
      'README.md',
      '*.json',
    ],
  },
  {
    files: ['app/**/*.ts'],
    rules: {
      'no-console': 'off',
      'node/prefer-global/process': 'off',
    },
  },
)
