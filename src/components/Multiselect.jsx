import React, { useEffect, useState } from "react";
import styles from "./Multiselect.module.css";

function Multiselect({ onChange, options }) {
  console.log("options: ", options);
  console.log("options.tags: ", options.tags);
  console.log("options.counts: ", options.counts);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(
        selectedOptions.filter((selectedOption) => selectedOption !== option)
      );
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  useEffect(() => {
    if (isOpen) setHighlightedIndex(0);
  }, [isOpen]);

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions]);

  return (
    <div
      tabIndex={0}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen((prevState) => !prevState)}
      className={styles.filterContainer}
    >
      <div className={styles.filterValueContainer}>
        {selectedOptions.length > 0 ? (
          <div className={styles.filterValues}>
            {selectedOptions.map((option) => (
              <div key={option.tags} className={styles.tag}>
                {option}{" "}
                <span className={styles.tagCount}>
                  ({options.counts[option]})
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                  className={styles["clear-btn"]}
                >
                  &times;
                </button>
              </div>
            ))}{" "}
          </div>
        ) : (
          <span style={{ color: "#272727" }}>Tags</span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedOptions([]);
        }}
        className={styles["clear-btn"]}
      >
        &times;
      </button>
      <div className={styles.divider}></div>
      <div className={styles.caret}></div>
      <ul className={`${styles.options} ${isOpen ? styles.show : ""}`}>
        {options?.tags?.map((option, index) => (
          <li
            onClick={(e) => {
              e.stopPropagation();
              toggleOption(option);
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            key={option.tags}
            className={`
                    ${styles.option} 
                    ${selectedOptions.includes(option) ? styles.selected : ""}
                    ${index === highlightedIndex ? styles.highlighted : ""}`}
          >
            {option}
            <span className={styles.tagCount}>({options.counts[option]})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// add <button className={styles["clear-btn"]}>&times;</button> to option when rendered in the filter values

export default Multiselect;
