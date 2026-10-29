import { signOut } from '../../api/authApi'
import styles from './SignOutButton.module.css'

export function SignOutButton() {
    return (
        <button className={styles.button} type="button" onClick={() => void signOut()}>
            Sair
        </button>
    )
}
