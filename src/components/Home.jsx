import React, { useState, useEffect } from 'react'
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import Create from './Create'
// import Search from './Search'
import Search from './Search';
import View from './View';

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
          <h2>Memoria</h2>
          <div className={styles.navItems}>
            <div className={styles.roundedGradientBorder}>
              <a className={styles.button1} target="_blank" href="https://www.notion.so/marcelocm/Memoria-About-Us-573ed80866d94413bffcd5022eab4e1d?pvs=4">About</a>
            </div>
            <div className={styles.roundedGradientBorder}>
              <button onClick={handleGoToProfile} className={styles.button1}>Profile</button>
            </div>
          </div>
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
          <button className={`${styles.pageSelectButton} ${ page=="Create" ? styles.pageSelectActive : styles.pageSelectButton }`} onClick={handleGoToCreate}>Create</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Search" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToSearch}>Search</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="View" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToView}>View</button>
        </div>
      </div>
    </div>
  )
}

export default Home