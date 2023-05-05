import React, { useState, useEffect } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './Search.module.css';
import * as Img from "../imgs" 

const Search = ({ session }) => {
  const [userNotes, setUserNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const navigate = useNavigate();
  const userId = session.id;
  const local = "http://localhost:8000/";
  const server = 'https://memoria-ai.herokuapp.com/';
  const current = server;
  const [userTags, setUserTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchUserNotes();
    getUserTags().then(tags => setUserTags(tags));
  }, [session])

  const handleTagSelection = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(selectedTag => selectedTag !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    console.log(selectedTags);
  };
  

  const fetchUserNotes = async () => {
    const userId = session.user.id;
    const response = await fetch(current+'fetchUserNotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    const notes = await response.json();
    setUserNotes(notes);
    console.log("SKDJFHSDKFJHSDKFJH")
    console.log(notes);
  };

  const getUserTags = async () => {
    const userId = session.user.id;
    const response = await fetch(current+'getUserTags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    const tags = await response.json();
    console.log(tags);
    return tags;
  };

  const deleteNote = async (id) => {
    const response = await fetch(current+'deleteNote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });
    fetchUserNotes();
  };
  
  const handleQuery = async () => {
    const userId = session.user.id;
    const response = await fetch(current+'queryUserThoughts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, searchTerm })
    });
    const gptResponse = await response.json();
    setQueryResponse(gptResponse);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleQuery();
    }
  };

  return (
    <div className={styles.body}>    
      <div className={styles.headline}>
        <h2>Thought Bank</h2>
      </div>
      <div className={styles.queryFilterBar}>
        <div className={styles.headline}>
          <h3>Query your thoughts, powered by GPT.</h3>
        </div>
        <div className={styles.roundedGradientBorder}>
          <input               
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.titleInput}
            placeholder='Query your thoughts here...'
            onKeyDown={handleKeyDown}
          />
        </div>
        <p>Press enter to submit query!</p>
        <button onClick={handleQuery} className={`${styles.submitQueryButton} ${styles.button1}`}>Submit Query!</button>
      </div>
      <div className={styles.tagList}>
        {userTags.map((tag) => (
          <span
            className={`${styles.tag} ${selectedTags.includes(tag) ? styles.selected : ''}`}
            onClick={() => handleTagSelection(tag)}
          > {tag}</span>
        ))}
      </div>
      <div className={styles.headline}>
      {queryResponse}
      </div>
      <div className={styles.noteGallery}>
      {userNotes.filter((note) => {
        if (selectedTags.length === 0) {
          return true; // Show all notes if no tags selected
        }
        return selectedTags.every((tag) => note.Tags.includes(tag));
      }).map((note) => (
        <div className={styles.note} key={note?.id}>
          <h3>{note?.title}</h3>
          <p>{note?.content}</p>
          {note?.Tags?.map((tag) => (
            <span className={styles.tag}>{tag}</span>
          ))}
          <button className={styles.button1} onClick={() => deleteNote(note?.id)}>Delete</button>
        </div>
      ))}

      </div>
      <button1 className={styles.button1} onClick={() => console.log(selectedTags)}>check tags</button1>
    </div>
  )
}

export default Search
