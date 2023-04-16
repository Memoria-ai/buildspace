import React, { useState, useEffect } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './Home.module.css';
import img from '../imgs/Memoria.png';

const SpeechRecognition = window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = 'en-US';

const Home = ({ session }) =>{
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState("");
  const [userNotes, setUserNotes] = useState([]);
  const [userTitle, setUserTitle] = useState('Title');
  const [gptResponse, setGptResponse] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedNotes, setSearchedNotes] = useState([]);
  const navigate = useNavigate();
  const userId = session.id;

  useEffect(() => {
    handleListen();
  }, [isListening]);

  
  // useEffect(() => {
  //   if (gptResponse !== '' && userTitle) {
  //     console.log("gptResponse and userTitle are set")
  //     addNote();
  //     setGptResponse('');
  //     setUserTitle('Title');
  //     setNote('');
  //   }
  // }, [gptResponse, userTitle]);
  
  const fetchUserNotes = async () => {
    const userId = session.user.id;
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (error) console.log('Error fetching notes:', error);
    else setUserNotes(notes);
    console.log("HEREERE")
  };

  useEffect(() => {  
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
    // await processMessageToChatGPT("This is an idea I have: " + note + ". Summarize the key points of this app (only write the points, no intro to the points)", 1000)
    // .then((response) => {
    //     setGptResponse(response);
    //   });
    addNote();
  
  };
  const addNote = async () => {
    if (!note) return;
    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        user_id: session.user.id,
        title: userTitle,
        content: note,
      })
      .single();
    if (error) console.log('Error inserting new note', error);
    else setUserNotes((prevNotes) => [...prevNotes, newNote]);
    fetchUserNotes();
  };

  async function processMessageToChatGPT(message, max_tokens){
    console.log(message)

    const response = await fetch('https://buildspace.herokuapp.com/gpt', {
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

  const deleteNote = async (id) => {
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.log('Error deleting note:', error);
    } else {
      const filteredNotes = userNotes.filter((note) => note.id !== id);
      setUserNotes(filteredNotes);
    }
    fetchUserNotes();
  };

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
    setShowAllNotes(true);
  }

  const handleSearchView = () => {
    setShowAllNotes(false);
  }

  const handleSearch = () => {
    const filteredNotes = userNotes.filter((note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchedNotes(filteredNotes);
  };

  return (
    <div className={styles.body}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p>Memoria</p>
          <button onClick={handleGoToProfile} className={styles.profileButton}><span>Profile</span></button>
        </div>
        <div className={styles.headline}>
          <h1>Save, organize, and develop thoughts using your voice.</h1>
          <p>Click the mic below and speak freely!</p>
        </div>
        <div>
          <button onClick={() => setIsListening(prevState => !prevState)} className={isListening ? styles.micButtonActive : styles.micButton}>{isListening ? <span>Stop</span> : <span>Start</span>}</button>
        </div>
        <div className={styles.noteContent}>
          <input value={userTitle} onChange={handleTitleChange} placeholder='note title' className={styles.titleInput}/>
          <textarea value={note} onChange={handleInputChange} placeholder='transcription' className={styles.transcript}/>
          <button onClick={handleButtonClick} className={styles.submitButton}><span>Commit</span></button>
        </div>
        <div className={styles.noteOptions}>
          <button onClick={handleNotesView} className={styles.profileButton}>View All Notes</button>
          <button onClick={handleSearchView}className={styles.profileButton}>Search for Notes</button>
        </div>
      {showAllNotes ? (
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
      ) : (
        <div className={styles.sectionDiv}>
          <div className={styles.searchContent}>
            <h1>Search by Title/Description</h1>
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
      )}
        <div className={styles.footer}>
              <p>Memoria <br/> Your NLP-powered Second Brain. <br/> built for buildspace n&w s3 </p>
        </div>
      </div>
    </div>
  );
}

export default Home;