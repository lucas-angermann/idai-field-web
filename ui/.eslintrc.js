module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    settings: {
        react: {
            version: "detect"
        }
    },
    extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    plugins: [
        "eslint-plugin-prefer-arrow"
    ],
    rules: {
        "@typescript-eslint/array-type": [
            "error",
            {
                "default": "array"
            }
        ],
        "@typescript-eslint/semi": [ "warn", "always" ],
        "@typescript-eslint/no-inferrable-types": 0,
        "prefer-arrow/prefer-arrow-functions": [
            "error",
            {
                "allowStandaloneDeclarations": true
            }
        ],
        "max-len": [
            "error",
            {
                "code": 120
            }
        ],
        "no-trailing-spaces": [
            "error",
            {
                "skipBlankLines": true
            }
        ],
        "no-multiple-empty-lines": [
            "error",
            {
                "max": 2
            }
        ],
        "quotes": [ "error", "single" ],
        "jsx-quotes": [ "error", "prefer-double" ]
    }
};
