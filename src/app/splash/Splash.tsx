import { useEffect, useRef, useState } from 'react'

import { ART_HEIGHT, ART_WIDTH } from '@/abertura'

import { drawFrame } from './drawFrame'
import styles from './Splash.module.css'
import { fitScale, isSplashFinished, markPlayedInSession, shouldPlaySplash } from './splashRules'

type Phase = 'playing' | 'leaving' | 'done'

const FADE_MS = 300
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function readSessionStorage(): Storage {
    return window.sessionStorage
}

function decideInitialPhase(): Phase {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
    const shouldPlay = shouldPlaySplash(readSessionStorage, reducedMotion)
    const phase: Phase = shouldPlay ? 'playing' : 'done'
    return phase
}

function focusPage(): void {
    const target = document.querySelector<HTMLElement>('main') ?? document.body
    if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1')
    }
    target.focus({ preventScroll: true })
}

function sizeCanvas(canvas: HTMLCanvasElement): number {
    const pixelRatio = window.devicePixelRatio || 1
    const cssScale = fitScale(window.innerWidth, window.innerHeight)
    const deviceScale = Math.max(1, Math.round(cssScale * pixelRatio))

    canvas.width = ART_WIDTH * deviceScale
    canvas.height = ART_HEIGHT * deviceScale
    canvas.style.width = `${canvas.width / pixelRatio}px`
    canvas.style.height = `${canvas.height / pixelRatio}px`
    return deviceScale
}

export function Splash() {
    const [phase, setPhase] = useState<Phase>(decideInitialPhase)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')
        if (phase !== 'playing' || !canvas || !context) {
            return undefined
        }

        markPlayedInSession(readSessionStorage)
        const scale = sizeCanvas(canvas)
        const startedAt = performance.now()
        let frameRequest = 0

        const leave = () => setPhase('leaving')

        const renderFrame = (now: number) => {
            const elapsedMs = now - startedAt
            if (isSplashFinished(elapsedMs)) {
                leave()
                return
            }
            drawFrame(context, scale, elapsedMs)
            frameRequest = requestAnimationFrame(renderFrame)
        }
        frameRequest = requestAnimationFrame(renderFrame)

        window.addEventListener('pointerdown', leave)
        window.addEventListener('keydown', leave)

        return () => {
            cancelAnimationFrame(frameRequest)
            window.removeEventListener('pointerdown', leave)
            window.removeEventListener('keydown', leave)
        }
    }, [phase])

    useEffect(() => {
        if (phase !== 'leaving') {
            return undefined
        }

        const timer = window.setTimeout(() => {
            focusPage()
            setPhase('done')
        }, FADE_MS)

        return () => window.clearTimeout(timer)
    }, [phase])

    if (phase === 'done') {
        return null
    }

    const className = phase === 'leaving' ? `${styles.splash} ${styles.leaving}` : styles.splash

    return (
        <section className={className} aria-label="Jotagê Games">
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
            <button type="button" className={styles.skip} onClick={() => setPhase('leaving')}>
                Pular
            </button>
        </section>
    )
}
