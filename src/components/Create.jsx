import React, { useState, useEffect } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './Create.module.css';
import * as Img from "../imgs" 

const SpeechRecognition = window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = 'en-US';

const Create = ({ session }) =>{
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
    handleListen();
  }, [isListening]);
  
  useEffect(() => {  
    console.log("useeffect ran")
    fetchUserNotes();
  }, [session]);

  const handleInputChange = (event) => {
    setNote(event.target.value);
  };

  const handleTitleChange = (event) => {
    setUserTitle(event.target.value);
  }

  const handleGoToProfile = () => {
    console.log(session);
    navigate('/account', {state:{session: session }});
  }

  const handleButtonClick = async (event) => {
    event.preventDefault();
    if(isListening){
      console.log("was listening, now stopping")
      setIsListening(false);
      mic.stop();
      mic.onend = () => {
        console.log('Stopped Mic on Click');
      }
      const title = await getGPTTitle();
      addNote(title);
    }
    else{
      addNote(userTitle);
    }  
  };

  const addNote = async (title) => {
    if (!note) return;
    const response = await fetch(current+'addNote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: session.user.id,
        title: title,
        content: note,
      }),
    });
  
    if (!response.ok) {
      console.error(response.statusText);
    } else {
      setNote('');
      setUserTitle('Title');
      fetchUserNotes();
    }
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

  async function processMessageToChatGPT(message, max_tokens){
    console.log(message)

    const response = await fetch(current+'gpt', {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        max_tokens: max_tokens,
      })
    });
    console.log(response)
    const data = await response.json();
    return data;
  }

  const handleListen = () => {
    if(isListening) {
        mic.start();
        mic.onend = () => {
            console.log('continue..');
            mic.start();
        }
    } else {
        mic.stop();
        mic.onend = () => {
            console.log("stopped mic onclick")
        }
    }
    
    mic.onstart = () => {
        console.log('Mics on');
    }

    mic.onresult = event => {
        const transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript).join('')
        console.log(transcript);
        setNote(transcript);
        mic.onerror = event => {
            console.log(event.error);
        }
    }
  }

  const handleNotesView = () => {
    setCurrentPage('notes');
  }

  const handleSearchView = () => {
    setCurrentPage('search');
  }

  const handleQueryView = () => {
    setCurrentPage('query')
  }

  // MOVE to backend
  const handleSearch = () => {
    const filteredNotes = userNotes.filter((note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchedNotes(filteredNotes);
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

  const handleListenChange = async () => {
    setIsListening(prevState => !prevState);
    console.log("handling listen change")
    getGPTTitle();
  }

  // move all logic to the backend test
  const getGPTTitle = async () => {
    console.log("getGPTTitle");
    if (isListening && note !== '') {
      const title = await processMessageToChatGPT("This is an idea I have: " + note + ". Return a title for the note that is a maximum of three words long. Return only the title, nothing else", 20);
      const formattedTitle = title.replace(/"/g, '');
      setUserTitle(formattedTitle);
      return formattedTitle;
    }
  };

  return (
    <div className={styles.body}>    
        <div className={styles.headline}>
          <h2>Save, organize, and develop thoughts using your voice.</h2>
        </div>
        <div>
          <button onClick={handleListenChange} className={isListening ? styles.micButtonActive : styles.micButton}><Img.MicIcon/></button>
        </div>
        <div className={styles.thoughtActionFields}>
          <input value={userTitle} onChange={handleTitleChange} placeholder='Thought Title' className={styles.thoughtTitle}/>
          <textarea value={note} onChange={handleInputChange} placeholder='Thought Transcription' className={styles.transcript}/>
          <div className={styles.thoughtActionMenu}>
            {/* make a discard thought option */}
            <button onClick={handleButtonClick} className={styles.button2}>Discard</button> 
            <div className={styles.roundedGradientBorder}>
              <button onClick={handleButtonClick} className={styles.button2}>Commit</button>
            </div>
          </div>
        </div>
        {/* <div className={styles.noteOptions}>
          <button onClick={handleNotesView} className={styles.profileButton}>View All Notes</button>
          <button onClick={handleSearchView}className={styles.profileButton}>Search for Notes</button>
          <button onClick={handleQueryView}className={styles.profileButton}>Query Thoughts</button>
      {currentPage === 'notes' ? (
        <div className={styles.sectionDiv}>
          <h1>My Notes</h1>
          {userNotes.map((note) => (
            <div className={styles.noteGallery} key={note?.id}>
              <span>{note?.title}</span>
              <p>{note?.content}</p>
              <button onClick={() => deleteNote(note?.id)}>Delete</button>
            </div>
          ))}
        </div>
      ) : currentPage === 'search' ? (
        <div className={styles.sectionDiv}>
          <div className={styles.searchContent}>
            <h1>Search by Keywords</h1>
            <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.titleInput}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          {searchedNotes.map((note) => (
            <div className={styles.noteGallery} key={note?.id}>
              <span>{note?.title}</span>
              <p>{note?.content}</p>
              <button onClick={() => deleteNote(note?.id)}>Delete</button>
            </div>
          ))}
        </div>
      ) : (
        
        <div className={styles.sectionDiv}>
          <div className={styles.searchContent}>
            <h1>Query Thoughts</h1>
            <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.titleInput}
            />
            <button onClick={handleQuery}>Query</button>
          </div>
          <div>
            <br />
            {queryResponse}
            <br /><br />
          </div>
        </div>
      )}
      </div> */}
    </div>
  );
}

export default Create;