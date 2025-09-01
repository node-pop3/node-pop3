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
      'import/unambiguous': 'off',
      'import/no-unresolved': 'off',
      'import/no-commonjs': 'off',
      'no-console': 'off',
      'no-shadow': ['error', {
        allow: ['Pop3Command']
      }],
      'no-unused-vars': ['error', {varsIgnorePattern: 'Pop3Command|str'}],
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords -- Off
      'sonarjs/no-hardcoded-passwords': 'off'
    }
  }
];

