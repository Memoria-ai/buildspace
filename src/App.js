import "./App.css";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./pages/Auth/Auth";
import Account from "./pages/Account/Account";
import Home from "./pages/Home/Home";
// import { Navigate } from 'react-router-dom'

function App() {
  const [session, setSession] = useState(null);
  const { localStorage } = window;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If a token is stored in local storage, create a session object
      const session = { access_token: token };
      setSession(session);
    } else {
      // supabase.auth.getSession().then(({ data: { session } }) => {
      //   setSession(session);
      //   localStorage.setItem('token', session.access_token);
      // });
    }
  }, []);

  return (
    <div className="container">
      <Auth />
    </div>
  );
}

export default App;
