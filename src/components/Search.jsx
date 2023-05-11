import React, { useState, useEffect } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './Search.module.css';
import * as Img from "../imgs" 

const Search = ({ session }) => {
  const [load, setLoad] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [messages, setMessages] = useState([]);

  const local = "http://localhost:8000/";
  const server = 'https://memoria-ai.herokuapp.com/';
  const current = local;
  const [userTags, setUserTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  const sendQuestion = async () => {
    setLoad(true);

    const userMessage = { text: searchTerm, role: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setSearchTerm('');

    const userId = session.user.id;
    const response = await fetch(current+'queryUserThoughts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, searchTerm })
    });

    const gptResponse = await response.json();
    const botMessage = { text: gptResponse, role: 'Memoria' };
    
    setMessages((prevMessages) => [...prevMessages, botMessage]);

    setLoad(false);
    setQueryResponse(gptResponse);
    setShowNote(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendQuestion();
    }
  };

  return (
    <div className={styles.body}>    
      <div className={styles.queryFilterBar}>
        <div className={styles.headline}>
          <h3>Talk to your thoughts, powered by GPT.</h3>
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
        <button onClick={sendQuestion} className={`${styles.submitQueryButton} ${styles.button1}`}>Submit Query!</button>
        <div className={load ? styles.loading : styles.hidden}>
          <img src={Img.LoadingGif} alt="Wait for it!" height="100"/>
        </div>
      </div>
      <div className={styles.chatHistory}>
          {messages.map((message, index) => (
            <div key={index} className={message.role == 'user' ? styles.userQuestion : styles.memoriaResponse}>
              {message.text}
            </div>
          ))}
        </div>
    </div>
  )
}

export default Search
