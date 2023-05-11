import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import styles from './Account.module.css';

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [website, setWebsite] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const session = location.state.session;
  // console.log(props.location.state)
  // console.log(props.location.state.session)
  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      console.log(session);
      if (session && session.user) {
        const { user } = session;
        let { data, error } = await supabase
          .from('profiles')
          .select(`username, website, avatar_url`)
          .eq('id', user.id)
          .single()``

        if (error) {
          console.warn(error);
        } else if (data) {
          setUsername(data.username);
          setWebsite(data.website);
          setAvatarUrl(data.avatar_url);
        }
      }
      setLoading(false);
    }

    getProfile();
  }, [session]);

  async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
}

  async function updateProfile(event) {
    event.preventDefault()

    setLoading(true)
    const { user } = session

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    }

    let { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }
  
  async function signOut(){
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className={styles.body}>
    {session ? (
    
    <form onSubmit={updateProfile} className={styles.body}>
      <div className={styles.roundedGradientBorder}>
        <button onClick={() => navigate('/')} className={styles.button1}>Go Home</button>
      </div>
      <div>
        <label htmlFor="email" className={styles.gradientText1}>Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      {/* <div>
        <label htmlFor="username" className={styles.gradientText1}>Name</label>
        <input
          id="username"
          type="text"
          required
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website" className={styles.gradientText1}>Website:</label>
        <input
          id="website"
          type="url"
          value={website || ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className={styles.roundedGradientBorder}>
        <button className={styles.button1} type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Update'}
        </button>
      </div> */}
      <div className={styles.roundedGradientBorder}>
        <button className={styles.button1} type="button" onClick={()=>signOut()}>
          Sign Out
        </button>
      </div>
    </form>
    ) : (
      <div>
        Loading
      </div>
    )
    }
    </div>
  )
}