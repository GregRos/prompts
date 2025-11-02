/** @type {import('prettier').Config} */
module.exports = {
    tabWidth: 4,
    arrowParens: "avoid",
    trailingComma: "none",
    printWidth: 80,
    semi: false,
    overrides: [
        {
            files: "*.{yaml,json,jsonc}",
            options: {
                tabWidth: 2
            }
        },
        {
            files: "*.md",
            options: {
                parser: "json5",
                rangeStart: 0,
                rangeEnd: 1
            }
        }
    ],
    plugins: [
        "prettier-plugin-organize-imports",
        "prettier-plugin-packagejson",
        "prettier-plugin-jsdoc"
    ]
}
