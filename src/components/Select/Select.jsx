import React, { useEffect, useState } from "react";
import styles from "../Multiselect/Multiselect.module.css";

function Select({ onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(options[0]);

  const toggleOption = (option) => {
    setSelectedOptions(option);
  };

  const resetOption = () => {
    setSelectedOptions(options[0]);
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
        {selectedOptions ? (
          <div className={styles.filterValues}>{selectedOptions.option}</div>
        ) : (
          <span>{options[0]}</span>
        )}
      </div>
      {selectedOptions != options[0] ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetOption();
          }}
          className={styles["clear-btn"]}
        >
          &times;
        </button>
      ) : (
        ""
      )}
      <div className={styles.divider}></div>
      <div className={styles.caret}></div>
      <ul className={`${styles.options} ${isOpen ? styles.show : ""}`}>
        {options?.map((option, index) => (
          <li
            onClick={(e) => {
              e.stopPropagation();
              toggleOption(option);
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            key={option.option}
            className={`
                    ${styles.option} 
                    ${index === highlightedIndex ? styles.highlighted : ""}`}
          >
            {option.option}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Select;
