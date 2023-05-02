import React, { useState, useEffect } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './Search.module.css';
import * as Img from "../imgs" 

const Search = ({ session }) => {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState("");
  const [userNotes, setUserNotes] = useState([]);
  const [userTitle, setUserTitle] = useState('Title');
  const [gptResponse, setGptResponse] = useState('');
  const [currentPage, setCurrentPage] = useState('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedNotes, setSearchedNotes] = useState([]);
  const [queryResponse, setQueryResponse] = useState('');
  const navigate = useNavigate();
  const userId = session.id;
  const local = "http://localhost:8000/";
  const server = 'https://memoria-ai.herokuapp.com/';
  const current = local;

  useEffect(() => {
    fetchUserNotes();
  })

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
  };

  const handleSearch = () => {
    const filteredNotes = userNotes.filter((note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchedNotes(filteredNotes);
  };

  const handleNotesView = () => {
    fetchUserNotes();
    setCurrentPage('notes');
    console.log(currentPage);
    console.log(userNotes);
  }

  const handleSearchView = () => {
    
    setCurrentPage('search');
  }

  const handleQueryView = () => {
    setCurrentPage('query')
  }

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
      <div className={styles.headline}>
      {queryResponse}
      </div>
      <div className={styles.noteGallery}>
      {userNotes.map((note) => (
        <div className={styles.note} key={note?.id}>
          <h3>{note?.title}</h3>
          <p>{note?.content}</p>
          <button className={styles.button1} onClick={() => deleteNote(note?.id)}>Delete</button>
        </div>
      ))}
      </div>
    </div>
  )
}

export default Search
