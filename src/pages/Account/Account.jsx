import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./Account.module.css";
import * as Img from "../../imgs";
import { motion } from "framer-motion";

const Account = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [name, setName] = useState(null);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function getSession() {
      const session = await supabase.auth.getSession();
      const token = localStorage.getItem("token");
      const user = await supabase.auth.getUser(token);
      setUser(user);
      setEmail(user?.data?.user?.email);
      if (session) {
        setEmail(session.user.email);
      }
      setSession(session);
      setLoading(false);
    }
    getSession();
  }, []);

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      if (session && session.user) {
        const { user } = session;
        let { data, error } = await supabase
          .from("profiles")
          .select(`username, full_name`)
          .eq("id", user.id)
          .single();

        if (error) {
          console.warn(error);
        } else if (data) {
          setUsername(data.username);
          setName(data.full_name);
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
      username: username,
      full_name: name,
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.navButton1}
            target="_blank"
            onClick={() => navigate("/view", { state: { session: session } })}
          >
            View Journals
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className={styles.navButton1}
          >
            Go Back Home
          </motion.button>
        </div>
        <button
          onClick={() => navigate("/home")}
          className={styles.mobileAboutItem}
        >
          Back!
        </button>
      </div>
      <div className={styles.inner}>
        {loading ? (
          <div>Loading ...</div>
        ) : user ? (
          <form onSubmit={updateProfile}>
            <div className={styles.formField}>
              <label htmlFor="email" className={styles.gradientText1}>
                Email:{" "}
              </label>
              <input
                id="email"
                type="text"
                style={{ border: "1px solid #272727", borderradius: "1rem" }}
                value={email}
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
          <div>session not available</div>
        )}
      </div>
    </div>
  );
};

export default Account;
