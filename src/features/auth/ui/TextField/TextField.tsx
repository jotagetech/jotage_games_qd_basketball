import styles from './TextField.module.css'

interface TextFieldProps {
    id: string
    label: string
    type: 'text' | 'email' | 'password'
    value: string
    autoComplete: string
    error?: string
    disabled: boolean
    onChange: (value: string) => void
}

export function TextField({
    id,
    label,
    type,
    value,
    autoComplete,
    error,
    disabled,
    onChange,
}: TextFieldProps) {
    const errorId = `${id}-error`

    return (
        <div className={styles.field}>
            <label className={styles.label} htmlFor={id}>
                {label}
            </label>
            <input
                className={styles.input}
                id={id}
                name={id}
                type={type}
                value={value}
                autoComplete={autoComplete}
                autoCapitalize="none"
                spellCheck={false}
                disabled={disabled}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && (
                <p className={styles.error} id={errorId}>
                    {error}
                </p>
            )}
        </div>
    )
}
