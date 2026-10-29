export default {
    plugins: ['stylelint-declaration-strict-value'],
    reportDescriptionlessDisables: true,
    rules: {
        'scale-unlimited/declaration-strict-value': [
            [
                'font-size',
                '/^padding(?:-.+)?$/',
                '/^margin(?:-.+)?$/',
                'gap',
                'row-gap',
                'column-gap',
                'color',
                'background-color',
                'border-color',
            ],
            {
                ignoreFunctions: false,
                ignoreVariables: true,
                ignoreValues: ['0', 'auto', 'inherit', '/^(?:calc|clamp)\\([\\s\\S]*\\)$/'],
            },
        ],
    },
}
