import ashNazg from 'eslint-config-ash-nazg';

export default [
  ...ashNazg(['sauron', 'node']),
  {
    ignores: [
      '.idea',
      'lib',
      'bin/pop.js',
      'pop.config.js',
      'coverage',
      'dist'
    ]
  },
  {
    settings: {
      polyfills: [
        'Promise',
        'URL'
      ]
    },
    rules: {
      // Using external to the file
      'unicorn/prefer-private-class-fields': 'off',
      'new-cap': 0
    }
  },
  {
    files: ['*.md/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        require: true,
        pop3: true,
        Pop3Command: true
      }
    },
    rules: {
      'import-x/unambiguous': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/no-commonjs': 'off',
      'no-console': 'off',
      'no-shadow': ['error', {
        allow: ['Pop3Command']
      }],
      'no-unused-vars': ['error', {varsIgnorePattern: 'Pop3Command|str'}]
    }
  }
];

