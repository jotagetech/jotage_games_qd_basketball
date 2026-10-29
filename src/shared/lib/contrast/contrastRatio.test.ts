import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { contrastRatio } from './contrastRatio'

const MIN_TEXT_CONTRAST = 4.5

const tokensCss = readFileSync(
    fileURLToPath(new URL('../../../app/styles/tokens.css', import.meta.url)),
    'utf8',
)

function readColor(name: string): string {
    const match = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(tokensCss)
    if (!match) {
        throw new Error(`Token de cor ausente: --color-${name}`)
    }

    return match[1]
}

const textPairs: [string, string][] = [
    ['text', 'night'],
    ['text', 'surface'],
    ['text', 'surface-raised'],
    ['text-muted', 'night'],
    ['text-muted', 'surface'],
    ['text-muted', 'surface-raised'],
    ['on-brand', 'brand'],
    ['on-hardwood', 'hardwood'],
    ['on-hardwood', 'hardwood-grain'],
    ['live', 'night'],
    ['live', 'surface'],
    ['brand', 'night'],
]

describe('contrastRatio', () => {
    it('devolve 21 para preto sobre branco', () => {
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    })

    it('devolve 1 para cores iguais', () => {
        expect(contrastRatio('#f25106', '#f25106')).toBeCloseTo(1, 5)
    })

    it('não depende da ordem das cores', () => {
        expect(contrastRatio('#1c1412', '#f6efe9')).toBeCloseTo(contrastRatio('#f6efe9', '#1c1412'), 10)
    })

    it('recusa cor fora do formato hexadecimal de seis dígitos', () => {
        expect(() => contrastRatio('laranja', '#ffffff')).toThrow()
    })
})

describe('pares de texto dos tokens', () => {
    it.each(textPairs)('%s sobre %s atinge AA', (foreground, background) => {
        const ratio = contrastRatio(readColor(foreground), readColor(background))

        expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST)
    })

    it('foco tem 3:1 sobre o fundo', () => {
        expect(contrastRatio(readColor('focus'), readColor('night'))).toBeGreaterThanOrEqual(3)
    })

    it('branco sobre o laranja da marca não passa AA', () => {
        expect(contrastRatio('#ffffff', readColor('brand'))).toBeLessThan(MIN_TEXT_CONTRAST)
    })
})
