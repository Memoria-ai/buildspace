import React, { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef(null)
  const [numQueries, setNumQueries] = useState();

  const local = "http://localhost:8000/";
  const server = 'https://memoria-ai.herokuapp.com/';
  const current = server;
  
  const [userTags, setUserTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  const fetchNumQueries = async() => {
    const userId = session.user.id;
    const response = await fetch(current+'fetchNumQueries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    const num_queries = parseInt(data, 10);
    setNumQueries(num_queries);
  };
  
  useEffect(() => {
    fetchNumQueries();
  }, [session])

  const incrNumQueries = async() => {
    const userId = session.user.id;
    const response = await fetch(current+'incrNumQueries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
  };

  const sendQuestion = async () => {
    if (!searchTerm.trim()) { return };

    setLoad(true);

    const userMessage = { text: searchTerm, role: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setSearchTerm('');
    incrNumQueries();
    console.log("running incrNumQueries");
  };

  // This waits for messages var to be updated before sending the request to backend
  useEffect(() => {
    const fetchData = async () => {
      if (load) {
        const userId = session.user.id;
        const response = await fetch(current+'queryUserThoughts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, messages })
        });
        const gptResponse = await response.json();
        const botMessage = { text: gptResponse, role: 'assistant' };
        
        setLoad(false);
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setQueryResponse(gptResponse);
      }
    };
  
    fetchData();
  }, [messages]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendQuestion();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  return (
    <div className={styles.body}>    
      <div className={styles.titleDesc}>
        <h3>Chat with your thoughts</h3>
        <p className={styles.description}>Ask questions. Brainstorm. Get summaries & reminders. <br/> Experience perfect memory.</p>
      </div>
      <div className={`${styles.queryBar} ${styles.roundedGradientBorder}`}>
        <input               
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className={styles.titleInput}
          placeholder='Summarize all my thoughts from this past week...'
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendQuestion} className={styles.mobileQuerySend}><Img.SendIcon/></button>
      </div>
      <div className={styles.chatHistory}>
        {messages.map((message, index) => (
          <div key={index} className={message.role == 'user' ? styles.userQuestion : styles.memoriaResponse}>
            {message.text}
          </div>
        ))}
        <div className={load ? styles.loading : styles.hidden}>
          <img src={Img.LoadingGif} alt="Wait for it!" height="100"/>
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default Search
