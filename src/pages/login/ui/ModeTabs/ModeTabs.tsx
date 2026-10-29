import styles from './ModeTabs.module.css'

export type LoginMode = 'sign-in' | 'sign-up'

interface ModeTabsProps {
    mode: LoginMode
    onChange: (mode: LoginMode) => void
}

const TABS: ReadonlyArray<{ mode: LoginMode; label: string }> = [
    { mode: 'sign-in', label: 'Entrar' },
    { mode: 'sign-up', label: 'Criar conta' },
]

export const PANEL_ID = 'login-panel'

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
    return (
        <div className={styles.tabs} role="tablist" aria-label="Acesso">
            {TABS.map((tab) => (
                <button
                    key={tab.mode}
                    className={styles.tab}
                    type="button"
                    role="tab"
                    id={`login-tab-${tab.mode}`}
                    aria-selected={mode === tab.mode}
                    aria-controls={PANEL_ID}
                    onClick={() => onChange(tab.mode)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
