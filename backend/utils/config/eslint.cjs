module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true,
        jest: true,
    },
    extends: ['airbnb-base', 'prettier'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
    },
    ignorePatterns: ['node_modules/', 'coverage/', 'dist/', 'build/', 'tests/test-output.txt'],
    rules: {
        eqeqeq: ['error', 'always'],
        'no-var': 'error',
        'prefer-const': 'error',
        'no-unsafe-optional-chaining': 'error',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-underscore-dangle': ['error', { allow: ['_id'] }],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: ['**/tests/**', '**/*.test.js', '**/*.spec.js'],
            },
        ],
        'no-useless-catch': 'off',
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',
        'consistent-return': 'off',
        'no-return-await': 'off',
        'no-param-reassign': 'off',
        'no-console': 'warn',
        'func-names': 'off',
    },
    overrides: [
        {
            files: ['**/models/**/*.js'],
            rules: {
                'no-underscore-dangle': ['error', { allow: ['_id', '__v'] }],
            },
        },
        {
            files: ['**/utils/middleware/**/*.js'],
            rules: {
                'no-console': 'off',
            },
        },
        {
            files: ['**/tests/**/*.js'],
            rules: {
                'no-unused-vars': 'off',
                'no-underscore-dangle': 'off',
                'no-useless-escape': 'off',
            },
        },
    ],
}
