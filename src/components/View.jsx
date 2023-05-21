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

    const local = "http://localhost:8000/";
    const server = 'https://memoria-ai.herokuapp.com/';
    const current = local;

    // const visibleTags = userTags === undefined ? [] : (showAllTags ? userTags : userTags.slice(0, 3));

    // Every time this is rendered, useEffect is called.
    useEffect(() => {
        fetchUserNotes();
        getUserTags();
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
      setUserTags(tags.tags);
      setCountedTags(tags.counts);
      if (showAllTags) {
        console.log("SHOW ALL TAGS" + tags.tags)
        setVisibleTags(tags.tags);
      } else {
        console.log("SHOW 3 TAGS" + tags.tags.slice(0, 3))
        setVisibleTags(tags.tags.slice(0, 3));
      }
      return tags;
    };
  
    // Deletes 'id' note.
    const deleteNote = async (id) => {
      const userId = session.user.id;
      const response = await fetch(current+'deleteNote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, userId })
      });
      const result = await response.json();
      await fetchUserNotes();
      await getUserTags();
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

  return (
    <div className={styles.body}>
      <h2>My Thoughts</h2>
      <div className={styles.filterTagList}>
        <p>Filter:</p>
        {visibleTags.map((tag) => (
          <div className={selectedTags.includes(tag) ? styles.selected : ''}>
            <div
              className={styles.button1}
              onClick={() => handleTagSelection(tag)}
            > 
              {tag} ({countedTags[tag]})
          </div>
          </div>
        ))}
      </div>
      
      {userTags.length > 3 && (
        <button onClick={handleTagViewChange}>
          <p className={styles.seeMore}>{!showAllTags ? '+ See All Tags' : '- See Less'}</p>
        </button>
      )}
      
      <div className={styles.gallery}>
      {userNotes.filter((note) => {
        if (selectedTags.length === 0) {
          return true; // Show all notes if no tags selected
        }
        if (!note) {
          return false;
        }
        return selectedTags.every((tag) => note.Tags && note.Tags.includes(tag));
      }).map((note) => (
        <div>
        <div className={styles.thoughtCard} key={note?.id}>
          <h3>{note?.title}</h3>
          <p>
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
          <button onClick={() => deleteNote(note?.id)}>
            <Img.TrashIcon/>
          </button>
        </div>
        <div className={styles.tagList}>
        {note?.Tags?.map((tag) => (
            <div className={styles.tag}>{tag}</div>
          ))}
        </div>
        </div>
      ))}
      </div>  
    </div>
  )
}

export default View