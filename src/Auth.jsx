import { useState } from 'react'
import { supabase } from './supabaseClient'
import styles from './Auth.module.css'
import Memoria from './imgs/Memoria.png'
import * as Img from "./imgs" 
import * as Feat from "./imgs/feature-cards"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const localhost = 'http://localhost:3000/buildspace';
  const backToApp = 'https://memoria-ai.github.io/buildspace/';
  const current = backToApp;


  // E-mail log in
  const handleLogin = async (event) => {
    event.preventDefault()

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo:  "https://memoria-ai.github.io/buildspace/" } });

    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false);
  }

  async function signInWithTwitter() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: current,
      }
    })
  }

  async function signInWithGoogle() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: current,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  return (
    <div className={styles.body}>
        <div className={styles.nav}>
          <h2>Memoria</h2>
          <div className={styles.roundedGradientBorder}>
            <a className={styles.button1} target="_blank" href="https://www.notion.so/marcelocm/Memoria-About-Us-573ed80866d94413bffcd5022eab4e1d?pvs=4">About Us</a>
          </div>
        </div>
        <div className={styles.inner}>
          <div className={styles.headline}>
            <h1>Welcome to Memoria</h1>
            <h2>Never forget yours thoughts again.</h2>
          </div>
          <div className={styles.signInMenu}>
            <div className={styles.roundedGradientBorder}>
              <button onClick={signInWithGoogle} className={styles.signInButton}><p>Sign in with Google</p><Img.GoogleIcon/></button>
            </div>
            <div className={styles.roundedGradientBorder}>
              <button onClick={signInWithTwitter} className={styles.signInButton}><p>Sign in with Twitter</p><Img.TwitterIcon/></button>
            </div>
          </div>
          <div className={loading ? '' : styles.hidden} >
            <img src={Img.LoadingGif} alt="Wait for it!" height="100"/>
          </div>
          <iframe className={styles.demoVid} width="627" height="405" src="https://www.youtube.com/embed/WCYqqdjtyE0?start=28" title="Memoria Demo" frameborder="0" allowfullscreen></iframe>
          <h3>Features:</h3>
          <div className={styles.gallery}>
            <img src={Feat.Feature1}/> 
            <img src={Feat.Feature2}/> 
            <img src={Feat.Feature3}/> 
            <img src={Feat.Feature4}/> 
          </div>
        </div>
        <div className={styles.footer}>
          <p>Made with love from California & Canada</p>
        </div>
    </div>
  )
}