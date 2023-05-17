import React, { useState, useEffect } from 'react'
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import Create from './Create'
// import Search from './Search'
import Search from './Search';
import View from './View';
import * as Img from '../imgs'
import { motion, AnimatePresence} from "framer-motion"

const Home = ({ session }) => {
  const [page, setPage] = useState("Create")
  const navigate = useNavigate();

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
    console.log(session);
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
          <button className={`${styles.pageSelectButton} ${ page=="Create" ? styles.pageSelectActive : styles.pageSelectButton }`} onClick={handleGoToCreate}>Create</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Search" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToSearch}>Ask</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="View" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToView}>View</button>
        </div>
      </div>
      <div className={styles.homeContent}>
      {page == "Create" ? (
        <Create session={session} />
      ) : page == "Search" ? (
        <Search session={session} />
      ) : (
        <View session={session} /> 
      )
      }
      </div>
      <div className={styles.mobilePageSelector}>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Create" ? styles.pageSelectActive : styles.pageSelectButton }`} onClick={handleGoToCreate}>{ page=="Create" ? <Img.CreateActive/> : <Img.CreateIcon/> }</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Search" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToSearch}>{ page=="Search" ? <Img.AskActive/> : <Img.AskIcon/> }</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="View" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToView}>{ page=="View" ? <Img.ViewActive/> : <Img.ViewIcon/> }</button>
        </div>
      </div>
    </div>
  )
}

export default Home