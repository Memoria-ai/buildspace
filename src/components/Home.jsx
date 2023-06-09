import React, { useState, useEffect } from 'react'
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import Create from './Create'
// import Search from './Search'
import Search from './Search';
import View from './View';
import * as Img from '../imgs'
import { motion, AnimatePresence} from "framer-motion"
// import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const session = location.state.session
  
  const [page, setPage] = useState("Create")
  const navigate = useNavigate();

  useEffect(() => {
    console.log('the session in the home page is: ', session);
    console.log(session.data.session.access_token)
  }, []);

  const handleGoToSearch = () => {
    setPage("Search");
  }

  const handleGoToCreate = () => {
    setPage("Create");
  }

  const handleGoToView = () => {
    setPage("View")
  }

  const handleGoToProfile = () => {
    navigate('/account', {state:{session: session }});
  }

  return (
    <div className={styles.body}>
      <div className={styles.nav}>
          <h2 className={styles.logo}>Memoria</h2>
          <div className={styles.webNavItems}>
            <motion.a             
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.navButton1} target="_blank" href="https://www.notion.so/marcelocm/Memoria-About-Us-573ed80866d94413bffcd5022eab4e1d?pvs=4">
              About
            </motion.a>
            <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToProfile} className={styles.navButton1}>
              Profile
            </motion.button>
          </div>
          <a className={styles.mobileAboutItem} target="_blank" href="https://www.notion.so/marcelocm/Memoria-About-Us-573ed80866d94413bffcd5022eab4e1d?pvs=4"><Img.AboutIcon/></a>
          <button onClick={handleGoToProfile} className={styles.mobileProfileItem}><Img.ProfileIcon/></button>
      </div>
      <div className={styles.webPageSelector}>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Create" ? styles.pageSelectActive : styles.pageSelectButton }`} onClick={handleGoToCreate}>Record</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Search" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToSearch}>Chat</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="View" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToView}>View</button>
        </div>
      </div>
      {/* <form className={styles.feedbackForm}>
      How are we doing from 1-5?
        <div className={styles.formField}>
          <div className={styles.formField}>          
            <label>1</label>
            <input type="radio" name="rating" value="1"/>
          </div>
          <div className={styles.formField}>          
            <label>2</label>
            <input type="radio" name="rating" value="2"/>
          </div>
          <div className={styles.formField}>          
            <label>3</label>
            <input type="radio" name="rating" value="3"/>
          </div>
          <div className={styles.formField}>          
            <label>4</label>
            <input type="radio" name="rating" value="4"/>
          </div>
          <div className={styles.formField}>          
            <label>5</label>
            <input type="radio" name="rating" value="5"/>
          </div>
        </div>
        <div className={styles.formField}>
          <label>Why: </label>
          <input type="text" style={{border: "1px solid #272727", borderradius: "1rem"}} placeholder="because..."/>
        </div>
        <input className={styles.navButton1} type="submit" value="Submit"/>
      </form> */}
      {page == "Create" ? (
        <Create session={session} />
      ) : page == "Search" ? (
        <Search session={session} />
      ) : (
        <View session={session} /> 
      )
      }
      <div className={styles.mobilePageSelector}>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Create" ? styles.pageSelectActive : styles.pageSelectButton }`} onClick={handleGoToCreate}>{ page=="Create" ? <Img.RecordActive/> : <Img.RecordIcon/> }</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Search" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToSearch}>{ page=="Search" ? <Img.ChatActive/> : <Img.ChatIcon/> }</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="View" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToView}>{ page=="View" ? <Img.ViewActive/> : <Img.ViewIcon/> }</button>
        </div>
      </div>
    </div>
  )
}

export default Home