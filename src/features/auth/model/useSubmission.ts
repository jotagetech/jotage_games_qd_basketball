import { useState } from 'react'

import { errorsFromFailure, hasErrors, type AuthFailure, type FormErrors } from '../lib/formErrors'

interface Submission {
    validate: () => FormErrors
    send: () => Promise<AuthFailure | null>
}

export function useSubmission() {
    const [pending, setPending] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})

    async function submit({ validate, send }: Submission) {
        const found = validate()

        if (hasErrors(found)) {
            setErrors(found)
            return
        }

        setErrors({})
        setPending(true)
        const failure = await send()
        setPending(false)

        if (failure) {
            setErrors(errorsFromFailure(failure))
        }
    }

    return { pending, errors, submit }
}
