import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Account from './components/Account'
import Home from './components/Home'
// import { Navigate } from 'react-router-dom'

function App() {
  const [session, setSession] = useState(null)
  // const navigate = Navigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    console.log(session)
  }, [])

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {console.log(session)}
      {!session ? (
        <Auth />
        // <div>here1</div>
      ) : (
        <Home session={session} />
        // <div>there</div>
      )}
    </div>
  )
}

export default App