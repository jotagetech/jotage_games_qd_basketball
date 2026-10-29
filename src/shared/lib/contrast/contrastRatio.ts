const HEX_COLOR_PATTERN = /^#([0-9a-f]{6})$/i
const LINEAR_THRESHOLD = 0.03928
const LINEAR_DIVISOR = 12.92
const GAMMA_OFFSET = 0.055
const GAMMA_SCALE = 1.055
const GAMMA_EXPONENT = 2.4
const CHANNEL_MAX = 255
const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722]
const FLARE = 0.05

function parseChannels(hex: string): number[] {
    const match = HEX_COLOR_PATTERN.exec(hex.trim())
    if (!match) {
        throw new Error(`Cor hexadecimal inválida: ${hex}`)
    }

    const digits = match[1]
    return [0, 2, 4].map((start) => parseInt(digits.slice(start, start + 2), 16) / CHANNEL_MAX)
}

function linearize(channel: number): number {
    if (channel <= LINEAR_THRESHOLD) {
        return channel / LINEAR_DIVISOR
    }

    return ((channel + GAMMA_OFFSET) / GAMMA_SCALE) ** GAMMA_EXPONENT
}

function relativeLuminance(hex: string): number {
    const channels = parseChannels(hex).map(linearize)
    return channels.reduce((sum, channel, index) => sum + channel * LUMINANCE_WEIGHTS[index], 0)
}

export function contrastRatio(foreground: string, background: string): number {
    const foregroundLuminance = relativeLuminance(foreground)
    const backgroundLuminance = relativeLuminance(background)
    const lighter = Math.max(foregroundLuminance, backgroundLuminance)
    const darker = Math.min(foregroundLuminance, backgroundLuminance)

    return (lighter + FLARE) / (darker + FLARE)
}
