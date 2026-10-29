import { getSupabaseClient } from '@/shared/api'

import type { Profile } from '../model/profile'

interface ProfileRow {
    user_id: string
    username: string
    display_name: string | null
}

const PROFILE_COLUMNS = 'user_id, username, display_name'

export async function fetchProfile(userId: string): Promise<Profile | null> {
    const client = getSupabaseClient()
    const { data, error } = await client
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('user_id', userId)
        .maybeSingle<ProfileRow>()

    if (error) {
        throw error
    }

    if (!data) {
        return null
    }

    const profile: Profile = {
        userId: data.user_id,
        username: data.username,
        displayName: data.display_name,
    }
    return profile
}
