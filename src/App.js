import "./App.css";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./pages/Auth/Auth";
import Account from "./pages/Account/Account";
import mixpanel from "mixpanel-browser";

mixpanel.init("993c78ba0ac28f0c6819d394f3406ac9", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
  ignore_dnt: true,
});

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

  // let btnClick = (e) => {
  //   console.log("Button Clicked 1");
  //   mixpanel.track("Button Clicked");
  //   console.log("Button Clicked 2");
  // };

  return (
    <div className="container">
      {/* <button onClick={() => btnClick()}>Test</button> */}
      <Auth />
    </div>
  );
}

export default App;
