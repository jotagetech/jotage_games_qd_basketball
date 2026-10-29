import { useViewer } from '@/entities/viewer'
import { ViewerMenu } from '@/features/auth'
import { AppHeader } from '@/shared/ui/app-header'

import { useRanking } from '../model/useRanking'
import styles from './RankingPage.module.css'
import { RankingTable } from './RankingTable/RankingTable'

export function RankingPage() {
    const viewer = useViewer()
    const { state, reload } = useRanking()

    return (
        <div className={styles.page}>
            <AppHeader>
                <ViewerMenu viewer={viewer} />
            </AppHeader>
            <main className={styles.content}>
                <RankingTable state={state} viewer={viewer} onRetry={reload} />
            </main>
        </div>
    )
}
