import { createContext } from 'react'

import type { Viewer } from './viewer'

export const ViewerContext = createContext<Viewer | null>(null)
