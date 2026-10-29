import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useViewer } from '@/entities/viewer'
import { LoginForm, SignUpForm } from '@/features/auth'

import styles from './LoginPage.module.css'
import { ModeTabs, PANEL_ID, type LoginMode } from './ModeTabs/ModeTabs'

export function LoginPage() {
    const viewer = useViewer()
    const [mode, setMode] = useState<LoginMode>('sign-in')

    if (viewer.phase === 'signed-in') {
        return <Navigate to="/" replace />
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link className={styles.home} to="/" aria-label="Voltar para os jogos">
                    <img
                        className={styles.logo}
                        src="/brand/quadruplo-duplo.png"
                        alt=""
                        width={48}
                        height={48}
                    />
                    <span className={styles.title}>QD Basketball</span>
                </Link>
            </header>
            <main className={styles.content}>
                <h1 className={styles.srOnly}>Acesse sua conta</h1>
                <ModeTabs mode={mode} onChange={setMode} />
                <div role="tabpanel" id={PANEL_ID} aria-labelledby={`login-tab-${mode}`}>
                    {mode === 'sign-in' ? <LoginForm /> : <SignUpForm />}
                </div>
            </main>
        </div>
    )
}
