import React from "react";
import styles from "../Auth.module.css";

export const CarouselItem = ({ item }) => {
  return (
    <div className={styles.carouselItem}>
      <img className={styles.carouselImg} src={item.icon} />
      <div className={`${styles.gradientText1} ${styles.carouselItemText}`}>
        {item.description}
      </div>
    </div>
  );
};
