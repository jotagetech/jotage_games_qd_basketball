import { useState, type FormEvent } from 'react'

import { signIn } from '../../api/authApi'
import { validateSignIn } from '../../lib/validateForms'
import { useSubmission } from '../../model/useSubmission'
import formStyles from '../AuthForm.module.css'
import { TextField } from '../TextField/TextField'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { pending, errors, submit } = useSubmission()

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const fields = { email, password }
        void submit({ validate: () => validateSignIn(fields), send: () => signIn(fields) })
    }

    return (
        <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
            {errors.form && (
                <p className={formStyles.formError} role="alert">
                    {errors.form}
                </p>
            )}
            <TextField
                id="login-email"
                label="E-mail"
                type="email"
                value={email}
                autoComplete="email"
                error={errors.email}
                disabled={pending}
                onChange={setEmail}
            />
            <TextField
                id="login-password"
                label="Senha"
                type="password"
                value={password}
                autoComplete="current-password"
                error={errors.password}
                disabled={pending}
                onChange={setPassword}
            />
            <button className={formStyles.submit} type="submit" disabled={pending}>
                {pending ? 'Entrando...' : 'Entrar'}
            </button>
        </form>
    )
}
