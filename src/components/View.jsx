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

    const local = "http://localhost:8000/";
    const server = 'https://memoria-ai.herokuapp.com/';
    const current = server;

    const visibleTags = showAllTags ? userTags : userTags.slice(0, 3);

    // Every time this is rendered, useEffect is called.
    useEffect(() => {
        fetchUserNotes();
        getUserTags().then(tags => setUserTags(tags));
      }, [session])
    
    const handleTagSelection = (tag) => {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(selectedTag => selectedTag !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
      console.log(selectedTags);
    }; 
  
    // Get notes from database and show it to user.
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
      console.log("SKDJFHSDKFJHSDKFJH")
      console.log(notes);
    };
  
    // Get all tags from database and show it to user.
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
  
    // Deletes 'id' note.
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

  const handleTagViewChange = () => {
    setShowAllTags((prevState) => !prevState);
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
  }).sort((a, b) => (b?.timestamp.localeCompare(a?.timestamp)));

  return (
    <div className={styles.body}>
      <h3>My Thoughts</h3>
      <div className={styles.filterTagList}>
        <p>Filter:</p>
        {visibleTags.map((tag) => (
          <div className={selectedTags.includes(tag) ? styles.selected : ''}>
            <div
              className={styles.tag}
              onClick={() => handleTagSelection(tag)}
            > 
              {tag}
          </div>
          </div>
        ))}
        <span className={styles.centerOnMobile}>
          {userTags.length > 3 && (
              <button onClick={handleTagViewChange} className={styles.seeMore}>{!showAllTags ? '+ See All' : '- See Less'}</button>
          )}
        </span>
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
                <div className={styles.tag}>{tag}</div>
              ))}
          </div>
          <div className={styles.cardBottom}>
            <p className={styles.description}>{new Date(note?.timestamp).toLocaleDateString()}</p>
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