import { ART_HEIGHT, ART_WIDTH, STUDIO_DURATION_MS, STUDIO_HOLD_MS } from '@/abertura'

export const SPLASH_STORAGE_KEY = 'splash-played'
export const SPLASH_TOTAL_MS = STUDIO_DURATION_MS + STUDIO_HOLD_MS

const MIN_SCALE = 1
const PLAYED_VALUE = '1'

export interface SplashStorage {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
}

type StorageProvider = () => SplashStorage

/** O acesso ao storage pode lançar (modo privado, cookies bloqueados), por isso chega por função. */
export function hasPlayedInSession(getStorage: StorageProvider): boolean {
    try {
        const stored = getStorage().getItem(SPLASH_STORAGE_KEY)
        const played = stored === PLAYED_VALUE
        return played
    } catch {
        // Sem storage não há como lembrar: a vinheta toca e o site segue.
        return false
    }
}

export function markPlayedInSession(getStorage: StorageProvider): void {
    try {
        getStorage().setItem(SPLASH_STORAGE_KEY, PLAYED_VALUE)
    } catch {
        // Falha ao gravar só faz a vinheta tocar de novo na próxima abertura.
    }
}

export function shouldPlaySplash(getStorage: StorageProvider, prefersReducedMotion: boolean): boolean {
    if (prefersReducedMotion) {
        return false
    }

    const alreadyPlayed = hasPlayedInSession(getStorage)
    const shouldPlay = !alreadyPlayed
    return shouldPlay
}

/** Maior escala inteira em que a arte cabe inteira na área dada, nunca menor que 1. */
export function fitScale(areaWidth: number, areaHeight: number): number {
    const horizontalScale = Math.floor(areaWidth / ART_WIDTH)
    const verticalScale = Math.floor(areaHeight / ART_HEIGHT)
    const scale = Math.max(MIN_SCALE, Math.min(horizontalScale, verticalScale))
    return scale
}

export function isSplashFinished(elapsedMs: number): boolean {
    const finished = elapsedMs >= SPLASH_TOTAL_MS
    return finished
}
