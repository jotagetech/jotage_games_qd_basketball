import type { PickFailure } from '../lib/pickError'

export type PickOutcome = { kind: 'saved' } | ({ kind: 'failed' } & PickFailure)

export type PickBoard =
    | { phase: 'loading' }
    | { phase: 'anonymous' }
    | { phase: 'unavailable' }
    | {
          phase: 'ready'
          picksByGame: Readonly<Record<number, number>>
          choose: (gameId: number, teamId: number) => Promise<PickOutcome>
      }
