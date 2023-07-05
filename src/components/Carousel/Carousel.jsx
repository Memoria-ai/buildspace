import React, { useEffect, useState } from "react";
import { CarouselItem } from "./CarouselItem";
import styles from "../../pages/Auth/Auth.module.css";
import * as Img from "../../imgs";

export const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = [
    {
      title: "Example 1",
      description: "Talk to your thoughts.",
      icon: require("../../imgs/chat-example-1.png"),
    },
  ];

  const updateIndex = (newIndex) => {
    if (newIndex < 0) {
      console.log("wrapped to back");
      newIndex = items.length - 1;
    } else if (newIndex >= items.length) {
      console.log("wrapped to front");
      newIndex = 0;
    }

    setActiveIndex(newIndex);
  };

  // useEffect(() => {
  //     const interval = setInterval(() => {
  //         updateIndex(prevIndex =>
  //             { if (prevIndex + 1 >= items.length) {
  //                 return 0;
  //             } else {
  //                 return prevIndex + 1;
  //             }}
  //             ) ;
  //     }, 3000);

  //     return () => {
  //         clearInterval(interval);
  //     };
  // }, []);

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselWrapper}>
        <div
          className={styles.carouselInner}
          style={{ transform: `translate(-${activeIndex * 100}%)` }}
        >
          {items.map((item) => {
            return <CarouselItem item={item} />;
          })}
        </div>
      </div>
      {/* <div className={styles.carouselButtons}>
            <button
            onClick={() => {
                updateIndex(activeIndex - 1);
            }}
            >
            <span className={styles.navButton1}>Back</span>
            </button>
            <button
            onClick={() => {
                updateIndex(activeIndex + 1);
            }}
            >
            <span className={styles.navButton1}>Next</span>
            </button>
        </div> */}
    </div>
  );
};
