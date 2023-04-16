import { useState } from 'react'
import { supabase } from './supabaseClient'
import styles from './Auth.module.css'
import Memoria from './imgs/Memoria.png'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo:  "https://memoria-ai.github.io/buildspace/" } });

    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  async function signInWithTwitter() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: 'http://localhost:3000/buildspace',
      }
    })
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://memoria-ai.github.io/buildspace/',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
      
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <img src={Memoria} alt="Memoria" className={styles.logo} />
        <div className={styles.header}>
          <h2>Memoria takes your ideas and stores them in a way that is actually useful for you.</h2>
        </div>
        <h3 className={styles.description}>Sign in </h3>
        
        <input
          className={styles.inputField}
          type="email"
          placeholder="Your email"
          value={email}
          required={true}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className={styles.googleButton} disabled={loading} onClick={handleLogin}>
          {loading ? <span>Loading</span> : <span>Sign in with Email</span>}
        </button>
        <hr className={styles.line}/>
        <button onClick={signInWithGoogle} className={styles.googleButton}>Sign in with Google</button>
        <button onClick={signInWithTwitter} className={styles.googleButton}>Sign in with Twitter</button>
      </div>
    </div>
  )
}