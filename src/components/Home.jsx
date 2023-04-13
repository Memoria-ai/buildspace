import React, { useState, useEffect } from 'react';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = 'en-US';

const Home = ({ session }) =>{
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const [userTitle, setUserTitle] = useState('');
  const [userInput, setUserInput] = useState('');
  const [gptResponse, setGptResponse] = useState('');
  const navigate = useNavigate();
  const userId = session.id;
  console.log(session);

// ??
  useEffect(() => {
    handleListen();
  }, [isListening]);

  useEffect(() => {
    if (gptResponse && userTitle) {
      addNote();
      setGptResponse(null);
      setUserTitle(null);
    }
  }, [gptResponse, userTitle]);

  useEffect(() => {
    // Get the user's ID from the session
    const userId = session.user.id;

    // Retrieve the user's notes from the database
    const fetchUserNotes = async () => {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId);

      if (error) console.log('Error fetching notes:', error);
      else setUserNotes(notes);
    };

    fetchUserNotes();
    console.log(userNotes)
  }, [userNotes]);

  // render the account page
  const handleGoToProfile = () => {
    console.log(session);
    navigate('/account', {state:{session: session }});
  }

  const handleButtonClick = async (event) => {
    event.preventDefault();
    await processMessageToChatGPT("This is an idea I have: " + note + ". Summarize the key points of this app (only write the points, no intro to the points)", 1000)
    .then((response) => {
        setGptResponse(response);
        setUserTitle('New Note');
      });
    // await addNote();
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

    // Clear the input fields
    // setUserTitle('');
    // setNote('');
  };

  async function processMessageToChatGPT(message, max_tokens){
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + process.env.REACT_APP_GPT_PRIVATE_KEY
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{role:'system', content:message}],
        max_tokens: max_tokens,
        n: 1,
        
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }


  const handleInputChange = (event) => {
    setUserInput(event.target.value);
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

  return (
    <div>
      <button onClick={handleGoToProfile}>Profile</button>
      <h1>Memoria</h1>
      <h2>Memoria takes your ideas and stores them in a way that is actually useful for you.</h2>
      {/* <input type="text" value={userInput} onChange={handleInputChange} /> */}
      {isListening ? <span>🎙️</span> : <span>🛑🎙️</span> }

      <button onClick={() => setIsListening(prevState => !prevState)}>Start/Stop</button>
      <h2>Current Note</h2>
      <br></br>
      <p>{note}</p>
      <button onClick={handleButtonClick}>Submit</button>
      <br/>
      <br/>
      <textarea value={gptResponse} readOnly />
      <br />
      <br />
      <h1>My Notes</h1>
      {userNotes.map((note) => (
        <div key={note?.id}>
          <h2>{note?.title}</h2>
          <p>{note?.content}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;