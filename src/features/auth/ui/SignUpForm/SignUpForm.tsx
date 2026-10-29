import { useState, type FormEvent } from 'react'

import { signUp } from '../../api/authApi'
import { validateSignUp } from '../../lib/validateForms'
import { useSubmission } from '../../model/useSubmission'
import formStyles from '../AuthForm.module.css'
import { TextField } from '../TextField/TextField'

export function SignUpForm() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { pending, errors, submit } = useSubmission()

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const fields = { username, email, password }
        void submit({ validate: () => validateSignUp(fields), send: () => signUp(fields) })
    }

    return (
        <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
            {errors.form && (
                <p className={formStyles.formError} role="alert">
                    {errors.form}
                </p>
            )}
            <TextField
                id="signup-username"
                label="Apelido"
                type="text"
                value={username}
                autoComplete="username"
                error={errors.username}
                disabled={pending}
                onChange={setUsername}
            />
            <TextField
                id="signup-email"
                label="E-mail"
                type="email"
                value={email}
                autoComplete="email"
                error={errors.email}
                disabled={pending}
                onChange={setEmail}
            />
            <TextField
                id="signup-password"
                label="Senha"
                type="password"
                value={password}
                autoComplete="new-password"
                error={errors.password}
                disabled={pending}
                onChange={setPassword}
            />
            <button className={formStyles.submit} type="submit" disabled={pending}>
                {pending ? 'Criando conta...' : 'Criar conta'}
            </button>
        </form>
    )
}
