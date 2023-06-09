import React, { useEffect, useState } from 'react';
import styles from './View.module.css';
// import Search from './Search'
import * as Img from "../imgs";

const View = ({ session }) => {
    const [userNotes, setUserNotes] = useState([]);
    const [userTags, setUserTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showAllTags, setShowAllTags] = useState(false);
    const [expandedNotes, setExpandedNotes] = useState([]);
    const [countedTags, setCountedTags] = useState({});
    const [visibleTags, setVisibleTags] = useState([]);
    const [audioUrl, setAudioUrl] = useState('');
    const [numQueries, setNumQueries] = useState();
    const [numWords, setNumWords] = useState(0);
    const [savedTime, setSavedTime] = useState(0);
    const [showSavedTime, setShowSavedTime] = useState(false);
    const [sortOption, setSortOption] = useState('Most Recent');

    const local = "http://localhost:8000/";
    const server = 'https://memoria-ai.herokuapp.com/';
    const current = server;

    const fetchNumQueries = async() => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      // console.log('token: ', token);
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
      return(num_queries);
    };
  
    const calcNumWords = (notes) => {
      var curWords = 0;
      for (const note of notes) {
        curWords += note.content.split(' ').length;
      };
      setNumWords(curWords);
      return(curWords);
    }

    // const visibleTags = userTags === undefined ? [] : (showAllTags ? userTags : userTags.slice(0, 3));

    // Every time this is rendered, useEffect is called.
    useEffect(() => {
      fetchUserNotes();
      getUserTags();
    }, [session])

    const calcSavedTime = async(notes) => {
      const num_queries = await fetchNumQueries();
      const num_words = calcNumWords(notes);
      setSavedTime(Math.round(10 * ( (num_queries * 2.31) + (0.019 * num_words))) / 10);
      setShowSavedTime(true);
    }

    const handleTagSelection = (tag) => {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(selectedTag => selectedTag !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
    }; 
  
    // Get notes from database and show it to user.

    const fetchUserNotes = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      // console.log('token: ', token);
      const response = await fetch(current + 'fetchNotes/' + userId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`, // Include the JWT token in the 'Authorization' header
        },
      });
    
      const notes = await response.json();
      setUserNotes(notes);
      calcSavedTime(notes);
    };    

    // Get all tags from database and show it to user.
    const getUserTags = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await fetch(current+'getUserTags/' + userId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ userId })
      });
      const tags = await response.json();
      setUserTags(tags.tags);
      setCountedTags(tags.counts);
      if (showAllTags) {

        setVisibleTags(tags.tags);
      } else {

        setVisibleTags(tags.tags.slice(0, 3));
      }
      return tags;
    };
  
    // Deletes 'id' note.
    const deleteNote = async (id) => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      // console.log('token: ', token);
      const response = await fetch(current+'deleteNote/' + userId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ id, userId })
      });
      const result = await response.json();
      await fetchUserNotes();
      await getUserTags();
    };

    const playNote = async (path) => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      // console.log('token: ', token);
      fetch(current + 'fetchNoteAudio/'+ userId,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ path: path })
      })
      .then(response => response.arrayBuffer())
      .then(audioBuffer => {
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' })
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = new Audio(audioUrl);
        audioElement.play();
      });
    };

  const handleTagViewChange = () => {
    setShowAllTags((prevState) => !prevState);
    if (!showAllTags) {
      setVisibleTags(userTags);
    } else {
      setVisibleTags(userTags.slice(0, 3));
    }
  }

  const toggleContent = (noteId) => {
    if (expandedNotes?.includes(noteId)) {
      setExpandedNotes((prevNotes) => prevNotes.filter((id) => id !== noteId));
    } else {
      setExpandedNotes((prevNotes) => [...prevNotes, noteId]);
    }
  };

  const sortedNotes = userNotes
  .filter((note) => {
    if (selectedTags.length === 0) {
      return true; // Show all notes if no tags selected
    }
    if (!note) {
      return false;
    }
    return selectedTags.every((tag) => note.Tags && note.Tags.includes(tag));
  }).sort((a, b) => 
    { if (sortOption == "Most Recent") {
      return (b?.timestamp.localeCompare(a?.timestamp));
    } else if (sortOption == "Oldest") {
      return (a?.timestamp.localeCompare(b?.timestamp));
    }
      }
    );

  const updateAllNotes = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    fetch(current + 'updateAllTitles/'+ userId,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({ userId })
    })
  }
 
  return (
    <div className={styles.body}>
      <h3>My Thoughts</h3>
      {/* <button onClick={updateAllNotes}>update tags</button> */}
      <div className={showSavedTime ? styles.savedTime : styles.hidden}>You've saved <span className={"gradientText1"}> {savedTime} minutes </span> using Memoria!</div>
      <div className={styles.filterTagList}>
        <p>Filter:</p>
        {visibleTags.map((tag) => (
          <div className={selectedTags.includes(tag) ? styles.selected : ''} key={tag}>
            <div
              className={styles.tag}
              onClick={() => handleTagSelection(tag)}
            > 
              {tag} <span className={styles.tagCount}>({countedTags[tag]})</span>
          </div>
          </div>
        ))}
        <span>
          {userTags?.length > 3 && (
              <button onClick={handleTagViewChange} className={styles.seeMore}>{!showAllTags ? '+ See All' : '- See Less'}</button>
          )}
        </span>
      </div>
      <div className={styles.sortToggle}>
        <p>Sort:</p>
        <select className={styles.sortOption} onChange={(event) => setSortOption(event.target.value)}>
          <option value="Most Recent">Most Recent</option>
          <option value="Oldest">Oldest</option>
        </select>
      </div>
      <div className={styles.gallery}>
      {sortedNotes.map((note) => (
        <div className={styles.thoughtCard} key={note?.id}>
          <h3 className={styles.noteTitle}>{note?.title}</h3>
          <p className={styles.transcript}>
            {!expandedNotes?.includes(note?.id) && (note?.content.length > 120) 
              ? note?.content.slice(0, 120)
              : note?.content }
            { note?.content.length > 120 ? ( 
              <span onClick={() => toggleContent(note?.id)} className={styles.seeMore} >
                {!expandedNotes?.includes(note?.id) ? '...See More' : '...See Less'}
              </span> 
            ) : (
              ''
            )} 
          </p>
          <div className={styles.tagList}>
            {note?.Tags?.map((tag) => (
                <div className={styles.tag} key={tag}>{tag}</div>
              ))}
          </div>
          <div className={styles.cardBottom}>
            <p className={styles.description}>{new Date(note?.timestamp).toLocaleDateString()}</p>
            { note?.thought_recording != null ? (
              <button className={styles.deleteButton} onClick={() => playNote(note?.thought_recording)}>
                <Img.PlayIcon/>
              </button>
            ) : (
              ''
            )}
            <button className={styles.deleteButton} onClick={() => deleteNote(note?.id)}>
              <Img.TrashIcon/>
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}

export default View