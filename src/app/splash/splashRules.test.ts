import { describe, expect, it } from 'vitest'

import {
    SPLASH_STORAGE_KEY,
    SPLASH_TOTAL_MS,
    fitScale,
    isSplashFinished,
    markPlayedInSession,
    shouldPlaySplash,
    type SplashStorage,
} from './splashRules'

function createMemoryStorage(): SplashStorage {
    const values = new Map<string, string>()
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => {
            values.set(key, value)
        },
    }
}

function unavailableStorage(): SplashStorage {
    throw new Error('storage indisponível')
}

describe('shouldPlaySplash', () => {
    it('toca na primeira abertura da sessão', () => {
        const storage = createMemoryStorage()
        expect(shouldPlaySplash(() => storage, false)).toBe(true)
    })

    it('não toca depois de marcada na sessão', () => {
        const storage = createMemoryStorage()
        markPlayedInSession(() => storage)
        expect(storage.getItem(SPLASH_STORAGE_KEY)).not.toBeNull()
        expect(shouldPlaySplash(() => storage, false)).toBe(false)
    })

    it('não toca com movimento reduzido', () => {
        const storage = createMemoryStorage()
        expect(shouldPlaySplash(() => storage, true)).toBe(false)
    })

    it('toca quando o storage lança erro', () => {
        expect(shouldPlaySplash(unavailableStorage, false)).toBe(true)
    })

    it('marcar com storage indisponível não lança', () => {
        expect(() => markPlayedInSession(unavailableStorage)).not.toThrow()
    })
})

describe('fitScale', () => {
    it('usa o menor dos eixos, em inteiros', () => {
        expect(fitScale(390, 844)).toBe(2)
        expect(fitScale(1920, 1080)).toBe(9)
    })

    it('nunca fica abaixo de 1', () => {
        expect(fitScale(100, 50)).toBe(1)
    })
})

describe('isSplashFinished', () => {
    it('só encerra ao completar a duração mais a pausa final', () => {
        expect(isSplashFinished(SPLASH_TOTAL_MS - 1)).toBe(false)
        expect(isSplashFinished(SPLASH_TOTAL_MS)).toBe(true)
    })
})
