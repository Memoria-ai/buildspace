import React, { useState, useEffect } from 'react'
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import Create from './Create'
import Search from './Search'

const Home = ({ session }) => {
  const [page, setPage] = useState("Create")
  const navigate = useNavigate();

  const handleGoToSearch = () => {
    setPage("Search");
  }

  const handleGoToCreate = () => {
    setPage("Create");
  }

  const handleGoToProfile = () => {
    console.log(session);
    navigate('/account', {state:{session: session }});
  }

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
          <h2>Memoria</h2>
          <div className={styles.navItems}>
            <div className={styles.roundedGradientBorder}>
              <a className={styles.button1} target="_blank" href="">About Us</a>
            </div>
            <div className={styles.roundedGradientBorder}>
              <button onClick={handleGoToProfile} className={styles.button1}><span>Profile</span></button>
            </div>
          </div>
      </div>
      <div className={styles.pageSelector}>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Create" ? styles.pageSelectActive : styles.pageSelectButton }`} onClick={handleGoToCreate}>Create</button>
        </div>
        <div className={styles.pageSelectDiv}>
          <button className={`${styles.pageSelectButton} ${ page=="Search" ? styles.pageSelectActive : styles.pageSelectButton }`}  onClick={handleGoToSearch}>Search</button>
        </div>
      </div>
      {page == "Create" ? (
        <Create session={session} />
        // <div>here1</div>
      ) : (
        <Search session={session} />
        // <div>there</div>
      )}
    </div>
  )
}

export default Home