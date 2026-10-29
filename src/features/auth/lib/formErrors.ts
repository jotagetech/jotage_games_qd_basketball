export type FormField = 'username' | 'email' | 'password' | 'form'

export type FormErrors = Partial<Record<FormField, string>>

export interface AuthFailure {
    field: FormField
    message: string
}

export function errorsFromFailure(failure: AuthFailure): FormErrors {
    const errors: FormErrors = { [failure.field]: failure.message }
    return errors
}

export function hasErrors(errors: FormErrors): boolean {
    const found = Object.keys(errors).length > 0
    return found
}
