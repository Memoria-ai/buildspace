import React, { useState, useEffect, useRef } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './Create.module.css';
import * as Img from "../imgs" 
import { motion } from "framer-motion"

const Create = ({ session }) =>{
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [note, setNote] = useState(" ");
  const [userNotes, setUserNotes] = useState([]);
  const [userTitle, setUserTitle] = useState('');
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();
  const userId = session.id;
  const [showNote, setShowNote] = useState(false);
  const [load, setLoad] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [chunks, setChunks] = useState([]);
  const chunksRef = useRef([]);
  const [confirmation, setConfirmation] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [stream, setStream] = useState(null);
  const [sentBlob, setSentBlob] = useState(null);

  const local = "http://localhost:8000/";
  const server = 'https://memoria-ai.herokuapp.com/';
  const current = local;


  useEffect(() => {
    const handlePermission = async () => {
      const hasPermission = localStorage.getItem('microphonePermission');
      if (hasPermission === 'granted') {
        setPermissionGranted(true);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
        localStorage.setItem('microphonePermission', 'granted');
        setStream(stream);
        stream.getTracks()[0].stop();
      } catch (error) {
        console.error('Error requesting microphone permission:', error);
      }
    };

    handlePermission();
  }, []);

  useEffect(() => {
    if(!isListening){
      // check if the mediaRecorder is running
      if(mediaRecorder !== null){
        mediaRecorder.stop();
      }
    }else{
      handleStartRecording();
    }

    if (mediaRecorder !== null) {
      mediaRecorder.addEventListener("dataavailable", (event) => {
        chunksRef.current.push(event.data);
      });
      mediaRecorder.addEventListener("stop", async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/mp3" });
        setAudioBlob(blob);
        setSentBlob(blob);
        await handleStopRecording(blob);
      });
    }
  }, [isListening]);
  
  // Our GPT Prompt
  async function processMessageToChatGPT(message, max_tokens){
    const userId = session.user.id;
    const token = localStorage.getItem('token');
    // console.log(token)
    const response = await fetch(current+'gpt/' + userId, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: message,
        max_tokens: max_tokens,
      })
    });
    const data = await response.json();
    return data;
  }

  const handleInputChange = (event) => {
    setNote(event.target.value);
  };

  // Every time a user changes the title, this is run.
  const handleTitleChange = (event) => {
    setUserTitle(event.target.value);
  }


  // When user clicks commit, this calls addNote()
  const handleCommitClick = async (event) => {
    event.preventDefault();
    addNote(userTitle);
    setSeconds(0);
    setShowNote(false);
    thoughtCommitConfirmation();
  };

  const thoughtCommitConfirmation = () => {
    // Give feedback to the user
    setConfirmation(true);
    const timer = setTimeout(() => {
      setConfirmation(false);
    }, 2000);
  }

  const addNote = async (title) => {
    if (!note) return; // if there is no transcript, aka no words, then do nothing
    const userId = session.user.id;
    const token = localStorage.getItem('token');
    // console.log(token)
    const response = await fetch(current+'addNote/' + userId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      //credentials: 'include',
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
      setNote(' ');
      setUserTitle('Title');
      setTags([]);
    }
  };

  // Add tags to the note previously add, this is called by addNote
  const sendTags = async () => {
    const userId = session.user.id;
    const token = localStorage.getItem('token');
    const response = await fetch(current+'addTags/' + userId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tags: tags,
        userId: session.user.id,
      }),
    });
  };

  const handleStartRecording = async () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setMediaRecorder(recorder);
    });
  };
  
  const handleStopRecording = async (blob) => {
    console.log('handleStopRecording')
    if (blob.size === 0) {
      return;
    }
    const formData = new FormData();
    formData.append('audio', blob, 'audio.mp3');
  
    try {
      const userId = session.user.id;
      const token = localStorage.getItem('token');
      const response = await fetch(current+'transcribe/' + userId, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('here')
      const data = await response.json();
      const transcript = data.transcription;
      setNote(data.transcription);
      stoppedListeningFunction(transcript);
    } catch (error) {
      console.log('Error:', error.message);
    }
  
    chunksRef.current = [];
    
  };
  const handleFileUpload = async (event) => {
    if (event.target.files.length === 0) return;
  
    handleTimerChange(false);
    setLoad(true);
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('audio', file);
  
    try {
      const userId = session.user.id;
      const token = localStorage.getItem('token');
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      const response = await fetch(current + 'transcribe/' + userId, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        setNote(data.transcription);
        stoppedListeningFunction(data.transcription);
      } else {
        console.log('An error occurred during transcription.');
        handleTimerChange(false);
        setLoad(false);
      }
    } catch (error) {
      console.log(error);
      handleTimerChange(false);
      setLoad(false);
    }
  };
  
  

  const handleDiscardClick = async (event) => {
    event.preventDefault();
    if(isListening){
      setIsListening(false);
    }
    setUserTitle("");
    setNote(" ");
    setTags([]);
    setSeconds(0);
    setShowNote(false);
    setAudioBlob(null);
    setChunks([]);
  };

  // When mic is clicked, this is run
  const handleListenChange = async () => {
    const prev = note;
    setIsListening(prevState => !prevState); // This lags 1 cycle, bc its async

    // set a 3 second timeout
    if (showNote) {  
      setShowNote(false);
    }

    // When the mic is listening, isListening will be false within this function
    if(!isListening) {
      if (seconds != 0) {
        setSeconds(0);
      }
      handleTimerChange(true);
    }
    else {
      handleTimerChange(false);
      setLoad(true);
    }
  }

  // Timer that is shown when recording.
  const handleTimerChange = (state) => {
    if (state) {
      setTimerInterval(setInterval(() => {
        setSeconds(seconds => seconds + 1)
      }, 1000));
    } else {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }

  const stoppedListeningFunction = async (note) => {
    await getTags(note);
    await getGPTTitle(note);
    setLoad(false);
    if (!note) {
      setSeconds(0);
    }
    else {
      setShowNote(true)
    }
  }

  // GPT prompt for Title
  const getGPTTitle = async (note) => {
    if (note !== '') {
      const title = await processMessageToChatGPT("Return a 3 word title for this following note: " + note, 20);
      const formattedTitle = title.replace(/"/g, '');
      setUserTitle(formattedTitle);
      return formattedTitle;
    }
  };

  // Get the user tags from the database.
  const getUserTags = async () => {
    const userId = session.user.id;
    const token = localStorage.getItem('token');
    const response = await fetch(current+'getUserTags/' + userId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId })
    });
    const tags = await response.json();
    return tags;
  };

  // Get tags to assign to each new note.
  const getTags = async (note1) => {
    if (note1 !== '') {
      const currentTags = await getUserTags();
      const preTags = await processMessageToChatGPT("Return a 3 individual keywords separated by commas that are related to this note: " + note1 + ". If any of these keywords are applicable, use them: " + currentTags, 20);
      const Tags = preTags.replace(/"/g, '');
      const arr = Tags.split(', ');
      setTags(arr);
      return arr;
    }
  };

  const handlePlayRecording = async () => {
    if (audioBlob !== null) {
      const audioUrl = URL.createObjectURL(sentBlob);
      const audioElement = new Audio(audioUrl);
      audioElement.play();
    }
  };

  const popUpTransitions = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    fadeOut: { opacity: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  return (
    <div className={styles.body}>
      <div className={styles.titleDesc}>
        <h2 className={showNote ? styles.hidden : ""}>Record a thought</h2>
        <p className={`${styles.description} ${showNote ? styles.hidden : ""}`}>Click the mic below to get started. <br/> We will transcribe your thought into clear text</p>
      </div>
      <div className={styles.micContainer}>
        <button 
          onClick={handleListenChange} 
          className={`${isListening ? styles.micButtonActive : styles.micButton} ${showNote ? styles.hidden : ""}`}>
          {isListening ? <Img.StopIcon/> : <Img.MicIcon/> } 
          <p 
            className={ isListening ? `${styles.timer} ${"gradientText1"}` : styles.hidden}>
              {seconds}s
          </p>
        </button>
      </div>
      <p className={`${styles.description} ${showNote || load ? styles.hidden : ""}`}>OR</p>
      <label htmlFor="fileInput" className={showNote || load? styles.hidden : styles.button1}>
        <span className={styles.buttonUpload}>Upload a Voice Memo</span>
      </label>
      <input
        type="file"
        id="fileInput"
        accept="audio/mpeg, audio/wav, audio/ogg, audio/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      {/* <div>{transcription}</div> */}
      <div className={load ? styles.loading : styles.hidden}>
        <img src={Img.LoadingGif} alt="Wait for it!" height="100"/>
        <p>Transcribing...</p>
      </div>
      <div className={showNote ? styles.thoughtCard : styles.hidden}>
        <input value={userTitle} onChange={handleTitleChange} placeholder='Thought Title' className={styles.thoughtTitle}/>
        <textarea value={note} onChange={handleInputChange} placeholder='Thought Transcription' className={styles.transcript}/>
        {tags.length > 0 && 
          <div className={styles.tagList}>
            Tags:
            {tags.map((tag, index) => <span key={index} className={styles.tag}> {tag}</span>)}
          </div>}
        <div className={styles.thoughtActionMenu}>
          <button onClick={handleDiscardClick} className={styles.thoughtActionButton1}>Discard</button> 
          <div className={styles.roundedGradientBorder}>
            <button onClick={handleCommitClick} className={styles.thoughtActionButton2}>Save</button>
          </div>
        </div>
        {/* <div>
          <button onClick={handlePlayRecording} className={styles.playButton}>Play</button>
        </div> */}
      </div>
      <div style={{ display: 'block'}}>
        <span onClick={() => setConfirmation(false)}>
        <motion.button 
        variants={popUpTransitions}
        initial="hidden"
        animate={confirmation ? "visible" : "fadeOut"}
        exit="exit"
        transition={{ duration: 0.2, delay: 1.0 }}
        className={styles.confirmationPopup}>
          <p>Saved</p>
        </motion.button>
        </span>
      </div>
    </div>
  );
}

export default Create;