import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { MissingSupabaseConfigError, getSupabaseClient } from '@/shared/api'

import { fetchProfile } from '../api/fetchProfile'
import type { Profile } from './profile'
import { deriveViewer } from './viewer'
import { ViewerContext } from './viewerContext'

interface ViewerProviderProps {
    children: ReactNode
}

function useSessionUserId(): string | null | undefined {
    const [userId, setUserId] = useState<string | null | undefined>(undefined)

    useEffect(() => {
        try {
            const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
                setUserId(session ? session.user.id : null)
            })
            return () => data.subscription.unsubscribe()
        } catch (error) {
            if (!(error instanceof MissingSupabaseConfigError)) {
                throw error
            }

            setUserId(null)
            return undefined
        }
    }, [])

    return userId
}

function useProfile(userId: string | null | undefined): Profile | null {
    const [profile, setProfile] = useState<Profile | null>(null)

    useEffect(() => {
        if (!userId) {
            setProfile(null)
            return undefined
        }

        let cancelled = false
        fetchProfile(userId)
            .then((loaded) => !cancelled && setProfile(loaded))
            .catch(() => undefined) // Sem perfil carregado, a interface usa o texto de reserva.

        return () => {
            cancelled = true
        }
    }, [userId])

    return profile
}

export function ViewerProvider({ children }: ViewerProviderProps) {
    const userId = useSessionUserId()
    const profile = useProfile(userId)
    const viewer = useMemo(() => deriveViewer(userId, profile), [userId, profile])

    return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
}
