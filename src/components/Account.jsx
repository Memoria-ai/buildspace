import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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
          .single()

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

  return (
    <div>
    {session ? (
    
    <form onSubmit={updateProfile} className="form-widget">
      <button onClick={() => navigate('/')}>Go Home</button>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          type="text"
          required
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="url"
          value={website || ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <button className="button block primary" type="submit" disabled={loading}>
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" type="button" onClick={() => supabase.auth.signOut()}>
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