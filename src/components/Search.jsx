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
  const [showSuggest, setShowSuggest] = useState(true);

  const local = "http://localhost:8000/";
  const server = 'https://memoria-ai.herokuapp.com/';
  const current = server;
  
  const [userTags, setUserTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  const fetchNumQueries = async() => {
    const userId = session.data.session.access_token;
    const token = localStorage.getItem('token');
    const response = await fetch(current+'fetchNumQueries/' + userId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    const num_queries = parseInt(data, 10);
    setNumQueries(num_queries);
  };
  
  useEffect(() => {
    fetchNumQueries();
    const savedMessages = JSON.parse(localStorage.getItem('messages'))
    if (savedMessages !== null) {
        setMessages(savedMessages)
    }
  }, [session])

  const incrNumQueries = async() => {
    // const userId = session.data.session.access_token;
    const userId = localStorage.getItem('userId');
    console.log("data is " + session.data.session)
    console.log("userid in incrnumquerires is" + userId)
    const token = localStorage.getItem('token');
    const response = await fetch(current+'incrNumQueries/' + userId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
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
    setShowSuggest(false);
    incrNumQueries();
  };

  // This waits for messages var to be updated before sending the request to backend
  useEffect(() => {
    const fetchData = async () => {
      if (load) {
        const userId = session.data.session.access_token;
        const token = localStorage.getItem('token');
        // console.log(token)
        const response = await fetch(current+'queryUserThoughts/' + userId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({ userId, messages })
        });
        const gptResponse = await response.json();
        const botMessage = { text: gptResponse, role: 'assistant' };
        
        setLoad(false);
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setQueryResponse(gptResponse);
        localStorage.setItem('messages', JSON.stringify([...messages, botMessage]));
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

  const askSuggested = async(question) => {
    setSearchTerm(question);
  }

  const clearMessages = () => {
    localStorage.removeItem('messages');
    setMessages([]);
    setShowSuggest(true);
  }

  return (
    <div className={styles.body}>    
      <div className={styles.titleDesc}>
        <h3>Chat with your thoughts</h3>
        <p className={styles.description}>Ask questions, get summaries & brainstorm. <br/> Experience perfect memory.</p>
      </div>
      <div className={showSuggest ? styles.suggestList : styles.hidden}>
        <button onClick={() => askSuggested("Summarize this week's thoughts")} className={styles.suggestQuestion}>Summarize this week's thoughts</button>
        <button onClick={() => askSuggested("What do I talk about most?")} className={styles.suggestQuestion}>What do I talk about most?</button>
        <button onClick={() => askSuggested("I'm bored, what should I do?")} className={styles.suggestQuestion}>I'm bored, what should I do?</button>
      </div>
      <div className={styles.queryWrapper}>
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
      <div className={styles.roundedGradientBorder}>
          <button onClick={() => clearMessages()} className={styles.suggestQuestion}><Img.TrashGradient/></button>
      </div>
      </div>
      <div className={styles.chatHistory}>
        {messages.map((message, index) => (
          <div key={index} className={message.role == 'user' ? styles.userQuestion : styles.memoriaResponse}>
            {message.text}
          </div>
        ))}
        <div className={load ? styles.loading : styles.hidden}>
          <img height="50" src={Img.LoadingGif} alt="Wait for it!"/>
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default Search
