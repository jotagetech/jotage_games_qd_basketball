import { ART_HEIGHT, ART_WIDTH, SCANLINE_COLOR, scanlineHeight, studioFrame } from '@/abertura'

const BACKGROUND_COLOR = '#000000'

function drawScanlines(context: CanvasRenderingContext2D, scale: number): void {
    const lineHeight = scanlineHeight(scale)
    if (lineHeight === 0) {
        return
    }

    context.fillStyle = SCANLINE_COLOR
    for (let row = 0; row < ART_HEIGHT; row += 1) {
        const lineTop = row * scale + scale - lineHeight
        context.fillRect(0, lineTop, ART_WIDTH * scale, lineHeight)
    }
}

/** Desenha o quadro do instante dado, com cada pixel da arte ocupando scale x scale pixels do canvas. */
export function drawFrame(context: CanvasRenderingContext2D, scale: number, elapsedMs: number): void {
    context.fillStyle = BACKGROUND_COLOR
    context.fillRect(0, 0, ART_WIDTH * scale, ART_HEIGHT * scale)

    for (const rect of studioFrame(elapsedMs)) {
        context.fillStyle = rect.color
        context.fillRect(rect.x * scale, rect.y * scale, rect.width * scale, rect.height * scale)
    }

    drawScanlines(context, scale)
}
