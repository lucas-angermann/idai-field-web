module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        '@typescript-eslint/array-type': [ 'warn', { 'default': 'array' } ],
        '@typescript-eslint/semi': [ 'warn', 'always' ],
        '@typescript-eslint/no-inferrable-types': 0,
        'max-len': [ 'warn', { 'code': 120 } ],
        'no-trailing-spaces': [ 'warn', { 'skipBlankLines': true } ],
        'no-multiple-empty-lines': [ 'warn', { 'max': 2 } ],
        'quotes': [ 'warn', 'single' ],
        'jsx-quotes': [ 'warn', 'prefer-double' ],
        'object-curly-spacing': ['warn', 'always'],
        'no-multi-spaces': ['warn']
    }
};
