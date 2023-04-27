import { useState } from 'react'
import { supabase } from './supabaseClient'
import styles from './Auth.module.css'
import Memoria from './imgs/Memoria.png'
import * as Img from "./imgs" 

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isListening, setIsListening] = useState(false);

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
        // 'https://memoria-ai.github.io/buildspace/',
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

  const handleListenChange = async () => {
    setIsListening(prevState => !prevState);
  }

  return (
    <div className={styles.body}>
      <div className={styles.inner}>
        <div className={styles.nav}>
          <p>Memoria</p>
          <div className={styles.roundedGradientBorder}>
            <a className={styles.button1} target="_blank" href="">About Us</a>
          </div>
        </div>
        <div className={styles.headline}>
          <h1>Welcome to Memoria.</h1>
        </div>
        <div>
          <button onClick={handleListenChange} className={isListening ? styles.micButtonActive : styles.micButton}>
            <Img.MicIcon/>
          </button>
        </div>
        <h2>Save, organize, and develop thoughts on your phone with voice</h2>
        <div className={styles.signInMenu}>
          <input
            className={styles.inputField}
            type="email"
            placeholder="person@memoria.ai"
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className={styles.roundedGradientBorder}>
          <button className={styles.button1} disabled={loading} onClick={handleLogin}>
            {loading ? (
            <span>Loading!</span>
            ) : <span>Sign in with Email </span>}
          </button>
          </div>
          <div className={styles.roundedGradientBorder}>
            <button onClick={signInWithGoogle} className={styles.button1}>Sign in with Google</button>
          </div>
          <div className={styles.roundedGradientBorder}>
            <button onClick={signInWithTwitter} className={styles.button1}>Sign in with Twitter </button>
          </div>
        </div>
        <div className={styles.preview}>
          <p>What it looks like inside...</p>
          <img src={Img.MemoriaCreateWire}/>
          <img src={Img.MemoriaSearchWire}/>
        </div>
        <div className={styles.footer}>
          <p>Memoria <br/> Your NLP-powered Second Brain. <br/> built for buildspace n&w s3 </p>
        </div>
      </div>
    </div>
  )
}