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
    <div className={styles.body}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p>Memoria</p>
        </div>
        <div className={styles.headline}>
          <h1>Save, organize, and develop thoughts using your voice.</h1>
          <p>Talk to our Al to build your very own second brain. Easily find and distill your thoughts using plain English</p>
        </div>
        <div className={styles.signInMenu}>
          <h1>Sign in...</h1>
          <input
            className={styles.inputField}
            type="email"
            placeholder="person@memoria.ai"
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className={styles.signInSubmit} disabled={loading} onClick={handleLogin}>
            {loading ? <span>Loading!</span> : <span>Sign in with Email -></span>}
          </button>
          <div className={styles.signInSocials}>
            <button onClick={signInWithGoogle} className={styles.signInSubmit}> <span>Sign in with Google </span></button>
            <button onClick={signInWithTwitter} className={styles.signInSubmit}> <span>Sign in with Twitter </span></button>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
          <p>Memoria <br/> Your NLP-powered Second Brain. <br/> built for buildspace n&w s3 </p>
        </div>
    </div>
  )
}