import "./App.css";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import Account from "./components/Account";
import Home from "./components/Home";
// import { Navigate } from 'react-router-dom'
function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If a token is stored in local storage, create a session object
      const session = { access_token: token };
      setSession(session);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        localStorage.setItem("token", session.access_token);
      });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      localStorage.setItem("token", session.access_token);
    });
  }, []);

  return (
    <div className="container">
      {console.log(session)}
      {!session ? <Auth /> : <Home session={session} />}
    </div>
  );
}

export default App;
