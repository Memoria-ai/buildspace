import { useState } from 'react'
import { supabase } from './supabaseClient'
import Styles from './Auth.css'
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
        redirectTo: 'https://memoria-ai.github.io/buildspace/',
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
    <div className="container">
      <div className="col-6 form-widget">
        {/* <h1 className="header">Supabase + React</h1> */}
        <img src={Memoria} alt="Memoria" className="logo" />
        <div className='header'>
          <h2>Memoria takes your ideas and stores them in a way that is actually useful for you.</h2>
        </div>
        <h3 className="description">Sign in </h3>
        
        <input
          className="inputField"
          type="email"
          placeholder="Your email"
          value={email}
          required={true}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className={'googleButton'} disabled={loading} onClick={handleLogin}>
          {loading ? <span>Loading</span> : <span>Sign in with Email</span>}
        </button>
        <hr className='line'/>
        <button onClick={signInWithGoogle} className='googleButton'>Sign in with Google</button>
        <button onClick={signInWithTwitter} className='googleButton'>Sign in with Twitter</button>
      </div>
    </div>
  )
}