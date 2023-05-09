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
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();
  const userId = session.id;
  const local = "http://localhost:8000/";
  const server = 'https://memoria-ai.herokuapp.com/';
  const current = server;
  const [showNote, setShowNote] = useState(false);
  const [load, setLoad] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);


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

  const handleCommitClick = async (event) => {
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
    setSeconds(0);
    setShowNote(false);
  };

  const handleDiscardClick = async (event) => {
    event.preventDefault();
    if(isListening){
      console.log("was listening, now stopping")
      setIsListening(false);
      mic.stop();
      mic.onend = () => {
        console.log('Stopped Mic on Click');
      }
    }
    setUserTitle("");
    setNote("");
    setTags([]);
    setSeconds(0);
    setShowNote(false);
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
        tags: tags,
      }),
    });
  
    if (!response.ok) {
      console.error(response.statusText);
    } else {
      await sendTags();
      setNote('');
      setUserTitle('Title');
      setTags([]);
      fetchUserNotes();
    }
  };

  const sendTags = async () => {
    console.log("sending tags" + tags)
    console.log("DSSDFSDFJHGSDFJHGDSJHFGDJFHSGSJDHFG")
    const response = await fetch(current+'addTags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: tags,
        userId: session.user.id,
      }),
    });
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

  // MOVE to backend
  const handleListenChange = async () => {
    if (showNote) {  
      setShowNote(false);
    }

    setIsListening(prevState => !prevState);
    console.log("handling listen change")

    if(isListening){
      handleTimerChange(true);
      setLoad(true);
      await getGPTTitle();
      await getTags();
      setLoad(false);
      setShowNote(true);
      console.log('here')
    }
    else {
      handleTimerChange(false);
      if (seconds != 0) {
        setSeconds(0);
      }
    }
  }

  const handleTimerChange = (state) => {
    if (!state) {
      setTimerInterval(setInterval(() => {
        setSeconds(seconds => seconds + 1)
      }, 1000));
    } else {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
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

  const getTags = async () => {
    console.log("getTags");
    if (isListening && note !== '') {
      const currentTags = await getUserTags();
      console.log(currentTags)
      const title = await processMessageToChatGPT("This is an idea I have: " + note + ". Return 3 one-word tags that are related to the note, and list them as the following example does - 'notes, plans, cooking'. If applicable, use the following tags if they relate to the note:" + currentTags + "Return only the tags, nothing else", 20);
      const Tags = title.replace(/"/g, '');
      const arr = Tags.split(', ');
      setTags(arr);
      console.log('array is here')
      console.log(arr);
      return arr;
    }
  };



  return (
    <div className={styles.body}>
      <h2>Click the mic to record your thoughts!</h2>
        <div>
          <button onClick={handleListenChange} className={isListening ? styles.micButtonActive : styles.micButton}>{isListening ? <Img.StopIcon/> : <Img.MicIcon/> } <p className={styles.timer}>{seconds}s</p></button>
        </div>
        <div className={load ? styles.loading : styles.hidden}>
          <img src={Img.LoadingGif} alt="Wait for it!" height="100"/>
        </div>
        <div className={showNote ? styles.thoughtCard : styles.hidden}>
          <input value={userTitle} onChange={handleTitleChange} placeholder='Thought Title' className={styles.thoughtTitle}/>
          <textarea value={note} onChange={handleInputChange} placeholder='Thought Transcription' className={styles.transcript}/>
          {tags.length > 0 && 
            <div className={styles.tagList}>
              {tags.map((tag) => <span className={styles.tag}> {tag}</span>)}
            </div>}
          <div className={styles.thoughtActionMenu}>
            <button onClick={handleDiscardClick} className={styles.thoughtActionButton1}>Discard</button> 
            <div className={styles.roundedGradientBorder}>
              <button onClick={handleCommitClick} className={styles.thoughtActionButton2}>Commit</button>
            </div>
          </div>
        </div>
    </div>
  );
}

export default Create;