import React, { useEffect, useState } from "react";
import styles from "./ThoughtCard.module.css";

const ThoughtCard = ({ onActivity, note, session }) => {
  const [content, setContent] = useState("");
  const [userTitle, setUserTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [load, setLoad] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const local = "http://localhost:8000/";
  const server = "https://memoria-ai.herokuapp.com/";
  const current = local;

  useEffect(() => {
    getNoteInfo();
  }, [note]);

  const getNoteInfo = async () => {
    // console.log("running");
    if (note) {
      const noteContent = note?.content;
      const noteTitle = note?.title;
      const noteTags = note?.tags;
      setContent(noteContent);
      setUserTitle(noteTitle);
      setTags(noteTags);
    }
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  // Every time a user changes the title, this is run.
  const handleTitleChange = (event) => {
    setUserTitle(event.target.value);
  };

  // When user clicks commit, this calls addNote()
  const handleUpdateClick = async (event) => {
    event.preventDefault();
    updateNote();
    thoughtCommitConfirmation();
  };

  const handleDiscardClick = async (event) => {
    event.preventDefault();
    getNoteInfo();
    onActivity();
  };

  const thoughtCommitConfirmation = () => {
    setConfirmation(true);
    const timer = setTimeout(() => {
      setConfirmation(false);
    }, 2000);
  };

  const popUpTransitions = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    fadeOut: { opacity: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };

  const deleteTag = (option) => {
    if (tags?.includes(option)) {
      setTags(tags.filter((tags) => tags !== option));
    }
  };

  const addTag = (event) => {
    if (event.target.value.trim()) {
      const tag = event.target.value;
      setTags([...tags, tag]);
    }
    event.target.value = ""; // Clear the input field after adding the tag
  };

  const adjustInputWidth = (event) => {
    event.target.style.width = 1 + event.target.value.length + "ch";
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addTag(event);
    }
  };

  const updateNote = async () => {
    if (!note) return; // if there is no transcript, aka no words, then do nothing
    console.log(note);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const response = await fetch(current + "updateNote/" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        title: userTitle,
        content: content,
        tags: tags,
        id: note.id,
      }),
    });

    if (!response.ok) {
      console.error(response.statusText);
    } else {
      await sendTags();
      setContent("");
      setUserTitle("Title");
      setTags([]);
    }

    onActivity();
  };

  const sendTags = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const response = await fetch(current + "addTags/" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        tags: tags,
        userId: userId,
      }),
    });
  };

  return (
    <div className={styles["card-container"]}>
      <input
        value={userTitle}
        onChange={handleTitleChange}
        placeholder="Thought Title"
        className={styles.thoughtTitle}
      />
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Your thought here..."
        className={styles.transcript}
      />
      <div className={styles.tagList}>
        Tags:
        {tags?.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
            <button
              onClick={() => {
                deleteTag(tag);
              }}
              className={styles["clear-btn"]}
            >
              &times;
            </button>
          </span>
        ))}
        {tags?.length < 3 ? (
          <input
            tabIndex={100}
            onBlur={addTag}
            onKeyDown={handleKeyDown}
            placeholder="Add Tag +"
            className={styles.addTag}
            onInput={adjustInputWidth}
          />
        ) : (
          ""
        )}
      </div>
      <div className={styles.thoughtActionMenu}>
        <button
          onClick={handleDiscardClick}
          className={styles.thoughtActionButton1}
        >
          Discard
        </button>
        <div className={styles.roundedGradientBorder}>
          <button
            onClick={handleUpdateClick}
            className={styles.thoughtActionButton2}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThoughtCard;
