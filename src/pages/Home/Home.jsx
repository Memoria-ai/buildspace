import React, { useState, useEffect } from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import Create from "../Create/Create";
// import Search from './Search'
import Search from "../Search/Search";
import View from "../View/View";
import * as Img from "../../imgs";
import { motion, AnimatePresence } from "framer-motion";
import Main from "../Main/Main";

const Home = ({ session }) => {
  const [page, setPage] = useState("Search");
  const navigate = useNavigate();

  useEffect(() => {
    // console.log('the session in the home page is: ', session);
    // console.log(session.data.session.access_token)
  }, []);

  const handleGoToSearch = () => {
    setPage("Search");
  };

  const handleGoToCreate = () => {
    setPage("Create");
  };

  const handleGoToView = () => {
    navigate("/view", { state: { session: session } });
  };

  const handleGoToProfile = () => {
    navigate("/account", { state: { session: session } });
  };

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
            onClick={handleGoToView}
          >
            View Journals
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToProfile}
            className={styles.navButton1}
          >
            Profile
          </motion.button>
        </div>
        <a
          className={styles.mobileAboutItem}
          target="_blank"
          onClick={handleGoToView}
        >
          <Img.ViewIcon />
        </a>
        <button
          onClick={handleGoToProfile}
          className={styles.mobileProfileItem}
        >
          <Img.ProfileIcon />
        </button>
      </div>
      <Main session={session} />
    </div>
  );
};

export default Home;
