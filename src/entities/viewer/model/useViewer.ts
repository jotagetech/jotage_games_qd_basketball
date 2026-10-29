import { useContext } from 'react'

import type { Viewer } from './viewer'
import { ViewerContext } from './viewerContext'

export function useViewer(): Viewer {
    const viewer = useContext(ViewerContext)

    if (!viewer) {
        throw new Error('useViewer precisa estar dentro de ViewerProvider.')
    }

    return viewer
}
