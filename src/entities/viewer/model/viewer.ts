import type { Profile } from './profile'

export type Viewer =
    | { phase: 'loading' }
    | { phase: 'anonymous' }
    | { phase: 'signed-in'; userId: string; profile: Profile | null }

/**
 * `undefined` significa que a sessão ainda não foi resolvida; `null`, que não
 * há sessão. O perfil só vale se pertencer ao usuário da sessão atual.
 */
export function deriveViewer(userId: string | null | undefined, profile: Profile | null): Viewer {
    if (userId === undefined) {
        return { phase: 'loading' }
    }

    if (userId === null) {
        return { phase: 'anonymous' }
    }

    const ownProfile = profile && profile.userId === userId ? profile : null
    return { phase: 'signed-in', userId, profile: ownProfile }
}
