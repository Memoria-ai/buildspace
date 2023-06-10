import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./Account.module.css";
import * as Img from "../imgs";
import { motion } from "framer-motion";

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
      // console.log(session);
      if (session && session.user) {
        const { user } = session;
        let { data, error } = await supabase
          .from("profiles")
          .select(`username, website, avatar_url`)
          .eq("id", user.id)
          .single()``;

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
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  }

  async function updateProfile(event) {
    event.preventDefault();

    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    };

    let { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className={styles.body}>
      <div className={styles.nav}>
        <h2 className={styles.logo}>Memoria</h2>
        <div className={styles.webNavItems}>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.navButton1}
            target="_blank"
            href="https://www.notion.so/marcelocm/Memoria-About-Us-573ed80866d94413bffcd5022eab4e1d?pvs=4"
          >
            About
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className={styles.navButton1}
          >
            Go Back Home
          </motion.button>
        </div>
        <button
          onClick={() => navigate("/")}
          className={styles.mobileAboutItem}
        >
          Back!
        </button>
      </div>
      <div className={styles.inner}>
        {session ? (
          <form onSubmit={updateProfile}>
            <div className={styles.formField}>
              <label htmlFor="email" className={styles.gradientText1}>
                Email:{" "}
              </label>
              <input
                id="email"
                type="text"
                style={{ border: "1px solid #272727", borderradius: "1rem" }}
                value={session.user.email}
                disabled
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.roundedGradientBorder}
            >
              <button onClick={() => signOut()} className={styles.button1}>
                Sign Out
              </button>
            </motion.div>
          </form>
        ) : (
          <div>Loading</div>
        )}
      </div>
    </div>
  );
}
