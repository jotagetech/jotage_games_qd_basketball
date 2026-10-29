import type { Viewer } from '@/entities/viewer'

import type { RankingEntry } from '../model/rankingEntry'

const PERCENT_FACTOR = 100

export function formatWinRate(winRate: number): string {
    const percent = Math.round(winRate * PERCENT_FACTOR)
    const text = `${percent}%`
    return text
}

export function isViewerEntry(entry: RankingEntry, viewer: Viewer): boolean {
    if (viewer.phase !== 'signed-in' || viewer.profile === null) {
        return false
    }

    const isSameUsername = viewer.profile.username === entry.username
    return isSameUsername
}
