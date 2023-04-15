import React, { useState, useEffect } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SpeechRecognition = window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = 'en-US';

const Home = ({ session }) =>{
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState("");
  const [userNotes, setUserNotes] = useState([]);
  const [userTitle, setUserTitle] = useState('New Note');
  const [gptResponse, setGptResponse] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedNotes, setSearchedNotes] = useState([]);
  const navigate = useNavigate();
  const userId = session.id;

  useEffect(() => {
    handleListen();
  }, [isListening]);

  
  useEffect(() => {
    if (gptResponse != '' && userTitle) {
      console.log("gptResponse and userTitle are set")
      addNote();
      setGptResponse('');
      setUserTitle('New Note');
      setNote('');
    }
  }, [gptResponse, userTitle]);


  
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
    await processMessageToChatGPT("This is an idea I have: " + note + ". Summarize the key points of this app (only write the points, no intro to the points)", 1000)
    .then((response) => {
        setGptResponse(response);
      });
  
  };
  const addNote = async () => {
    if (!note) return;
    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        user_id: session.user.id,
        title: userTitle,
        content: gptResponse,
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
      note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchedNotes(filteredNotes);
  };

  return (
    <div>
      <button onClick={handleGoToProfile}>Profile</button>
      <h1>Memoria</h1>
      <h2>Memoria takes your ideas and stores them in a way that is actually useful for you.</h2>
      {isListening ? <span>🎙️</span> : <span>🛑🎙️</span> }
      <button onClick={() => setIsListening(prevState => !prevState)}>Start/Stop</button>
      <h2>Current Note</h2>
      <br></br>
      <textarea value={userTitle} onChange={handleTitleChange} />
      <textarea value={note} onChange={handleInputChange} />
      <button onClick={handleButtonClick}>Submit</button>
      <br />
      <br />
      <br />
      <button onClick={handleNotesView}>View All Notes</button>
      <button onClick={handleSearchView}>Search by Title</button>
      <br/>
      
      {showAllNotes ? (
        <div>
          <h1>My Notes</h1>
          {userNotes.map((note) => (
            <div key={note?.id}>
              <h2>{note?.title}</h2>
              <p>{note?.content}</p>
              <button onClick={() => deleteNote(note?.id)}>Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2>Search by Title</h2>
          <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          {searchedNotes.map((note) => (
            <div key={note?.id}>
              <h2>{note?.title}</h2>
              <p>{note?.content}</p>
              <button onClick={() => deleteNote(note?.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Home;