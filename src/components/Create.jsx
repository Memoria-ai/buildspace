import React, { useState, useEffect, useRef } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './Create.module.css';
import * as Img from "../imgs" 

const Create = ({ session }) =>{
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [note, setNote] = useState(" ");
  const [userNotes, setUserNotes] = useState([]);
  const [userTitle, setUserTitle] = useState();
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();
  const userId = session.id;
  const [showNote, setShowNote] = useState(false);
  const [load, setLoad] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [chunks, setChunks] = useState([]);
  const chunksRef = useRef([]);

  const local = "http://localhost:8000/";
  const server = 'https://memoria-ai.herokuapp.com/';
  const current = server;

  useEffect(() => {
    console.log("MAIN USEEFFECT IS RUNNING")
    if(!isListening){
      console.log('handleStopRecording is running')
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
        console.log("MEDIA RECORDER IS STOPPING");
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        await handleStopRecording();
      });
    }
  }, [isListening]);
  
    // Our GPT Prompt
  async function processMessageToChatGPT(message, max_tokens){
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
  };

  const addNote = async (title) => {
    if (!note) return; // if there is no transcript, aka no words, then do nothing

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
      setNote(' ');
      setUserTitle('Title');
      setTags([]);
    }
  };

  // Add tags to the note previously add, this is called by addNote
  const sendTags = async () => {
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

  const handleStartRecording = async () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setMediaRecorder(recorder);
    });
  };
  
  const handleStopRecording = async () => {
    console.log("handleStopRecording is running LKJSDFLKJDSFLKJSDLFKJSDFLKJSDLFKJ");
    const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    try {
      const response = await fetch(`${current}audio`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setNote(data.text);
      await stoppedListeningFunction(data.text);
    } catch (error) {
      console.log(error.data.error);
    }
    chunksRef.current = [];
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
    console.log("handleListenChange: " + isListening)
    // set a 3 second timeout
    if (showNote) {  
      setShowNote(false);
    }
    if(!isListening) {
      if (seconds != 0) {
        setSeconds(0);
      }
      handleTimerChange(true);
    }
  }

  // Timer that is shown when recording.
  const handleTimerChange = (state) => {
    if (state) {
      console.log("start timer");
      setTimerInterval(setInterval(() => {
        setSeconds(seconds => seconds + 1)
      }, 1000));
    } else {
      console.log("stop timer");
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }

  const stoppedListeningFunction = async (note) => {
    console.log("PASSED IN NOTE IS " + note)
    handleTimerChange(false);
    setLoad(true);
    await getTags(note);
    await getGPTTitle(note);
    setLoad(false);
    console.log('note' + note)
    if (!note) {
      setSeconds(0);
    }
    else {
      setShowNote(true)
    }
    console.log('here')
  }

  // GPT prompt for Title
  const getGPTTitle = async (note) => {
    console.log("THIS IS FIRST")
    console.log(note)
    if (note !== '') {
      console.log("THIS IS SECOND")
      const title = await processMessageToChatGPT("Return a 3 word title for this following note: " + note, 20);
      const formattedTitle = title.replace(/"/g, '');
      setUserTitle(formattedTitle);
      console.log("THE TITLE IS" + formattedTitle)
      return formattedTitle;
    }
  };

  // Get the user tags from the database.
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
    return tags;
  };

  // Get tags to assign to each new note.
  const getTags = async (note1) => {
    console.log("getTags is running")
    if (note1 !== '') {
      console.log("IN THE GETTAGS, THE NOTE IS " + note1)
      const currentTags = await getUserTags();
      const preTags = await processMessageToChatGPT("Return a 3 individual keywords separated by commas that are related to this note: " + note + ". If any of these keywords are applicable, use them: " + currentTags, 20);
      console.log(preTags)
      const Tags = preTags.replace(/"/g, '');
      const arr = Tags.split(', ');
      setTags(arr);
      return arr;
    }
  };

  const handlePlayRecording = async () => {
    if (audioBlob !== null) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      audioElement.play();
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
          <div>
            <button onClick={handlePlayRecording} className={styles.playButton}>Play</button>
          </div>
        </div>
    </div>
  );
}

export default Create;