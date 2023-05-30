import { useState } from 'react'
import { supabase } from './supabaseClient'
import styles from './Auth.module.css'
import Memoria from './imgs/Memoria.png'
import * as Img from "./imgs" 
import * as Feat from "./imgs/feature-cards"
import { motion } from "framer-motion"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const localhost = 'http://localhost:3000/';
  const backToApp = 'https://memoria.live/';
  const current = backToApp;


  async function signInWithTwitter() {
    setLoading(true);
    const { data, error, session } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: current,
      },
    });
    if (error) {
      console.error('Error signing in with Twitter:', error);
      return;
    }
  
    if (session) {
      console.log('token: ', token)
      console.log(session)
      const token = session.access_token;
      localStorage.setItem('token', token);
      // setSession(session); // Update the session in App component state
    }
  }
  
  async function signInWithGoogle() {
    setLoading(true);
    const { data, error, session } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: current,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  
    if (error) {
      console.error('Error signing in with Google:', error);
      return;
    }
  
    if (session) {
      const token = session.access_token;
      console.log('token: ', token)
      console.log(session)
      localStorage.setItem('token', token);
      // setSession(session); // Update the session in App component state
    }
  }
  
  

  return (
    <div className={styles.body}>
        <div className={styles.authNav}>
          <h2 className={styles.logo}>Memoria</h2>
          <div className={styles.webNavItems}>
            <motion.a             
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.navButton1} target="_blank" href="https://www.notion.so/marcelocm/Memoria-About-Us-573ed80866d94413bffcd5022eab4e1d?pvs=4">
              About
            </motion.a>
            <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.navButton1} target="_blank" href="mailto:hello@memoria.live">
              Contact
            </motion.a>
          </div>
        </div>
        <div className={styles.inner}>
          <motion.div     
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={styles.headline}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1}}
              transition={{ duration: 1, 
                ease: "linear",
                scale: {
                  type: "spring",
                  damping: 5,
                  stiffness: 120,
                  restDelta: 0.001
                } }}
              whileHover={{ scale: 1.1 }}
              className={styles.headlineButton}>
                Introducing Your Second Brain...
            </motion.div>
            <h1 className={styles.memoriaName}>Memoria</h1>
            <h2 className={styles.memoriaTagline}>Record, Transcribe and Chat with your thoughts, powered by AI.</h2>
          </motion.div>
          <motion.div     
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={styles.signInMenu}>
            <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.roundedGradientBorder}>
              <button     
              onClick={signInWithGoogle} className={styles.signInButton}>
                <p>Sign in with Google</p><Img.GoogleIcon/>
              </button>
            </motion.div>
            <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.roundedGradientBorder}>
              <button onClick={signInWithTwitter} className={styles.signInButton}><p>Sign in with Twitter</p><Img.TwitterIcon/></button>
            </motion.div>
          </motion.div>
          <div className={loading ? '' : styles.hidden} >
            <img src={Img.LoadingGif} alt="Wait for it!" height="100"/>
          </div>
          <motion.iframe             
          whileHover={{ scale: 1.05 }}
          className={styles.demoVid} width="627" height="405" src="https://www.youtube.com/embed/WCYqqdjtyE0?start=29" title="Memoria Demo" frameBorder="0" allowFullScreen></motion.iframe>
          <div className={styles.featureGallery}>
            <h3>Features:</h3>
            <div className={styles.gallery}>
              <motion.img whileHover={{ scale: 1.05 }} src={Feat.Feature1}/> 
              <motion.img whileHover={{ scale: 1.05 }} src={Feat.Feature2}/> 
              <motion.img whileHover={{ scale: 1.05 }} src={Feat.Feature3}/> 
              <motion.img whileHover={{ scale: 1.05 }} src={Feat.Feature4}/> 
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <p>Made with love in California & Canada</p>
          <motion.a 
            whileHover={{ scale: 1.05 }} 
            target="_blank" 
            href="https://marcelocm.notion.site/Privacy-Policy-36f06b276579426ab6b88f182ea0c70e" 
            className={styles.navButton1}>
              Privacy Policy
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}  
            target="_blank" 
            href="https://marcelocm.notion.site/Terms-and-Conditions-c878d809e76a43e8b98b89acd9bd2553" 
            className={styles.navButton1}>
              Terms and Conditions
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            className={styles.navButton1} 
            target="_blank" 
            href="mailto:hello@memoria.live">
              Contact Us
            </motion.a>
        </div>
    </div>
  )
}