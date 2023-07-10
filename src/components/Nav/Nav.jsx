import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Img from "../../imgs";
import { motion, AnimatePresence } from "framer-motion";
// import Main from "../Main/Main";

const Nav = ({ session }) => {
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
    <div className="w-full h-[5.25rem] flex flex-row justify-center md:justify-between items-center py-8 px-16 md:px-32 relative">
      <h2 className="font-bold text-[24pt] w-fit">Memoria</h2>
      <div className="md:flex flex-row hidden gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="navButton"
          target="_blank"
          onClick={handleGoToView}
        >
          View Journals
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoToProfile}
          className="navButton"
        >
          Profile
        </motion.button>
      </div>
      <div className="md:hidden stroke-[#555555]">
        <a
          className="absolute left-8 top-1/2 -translate-y-1/2"
          target="_blank"
          onClick={handleGoToView}
        >
          <Img.ViewIcon />
        </a>
        <button
          onClick={handleGoToProfile}
          className="absolute right-8 top-1/2 -translate-y-1/2"
        >
          <Img.ProfileIcon />
        </button>
      </div>
    </div>
  );
};

export default Nav;
