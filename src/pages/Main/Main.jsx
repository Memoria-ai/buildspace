import React, { useState, useEffect, useRef } from "react";
import Account from "../Account/Account";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import styles from "./Main.module.css";
import * as Img from "../../imgs";
import { motion } from "framer-motion";

const Main = ({ session }) => {
  // console.log('the create jsx session: ', session);
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [note, setNote] = useState("");
  const [userNotes, setUserNotes] = useState([]);
  const [userTitle, setUserTitle] = useState("");
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();
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

  const [mode, setMode] = useState("");

  const local = "http://localhost:8000/";
  const server = "https://memoria-ai.herokuapp.com/";
  const current = server;

  useEffect(() => {
    const handlePermission = async () => {
      const hasPermission = localStorage.getItem("microphonePermission");
      if (hasPermission === "granted") {
        setPermissionGranted(true);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setPermissionGranted(true);
        localStorage.setItem("microphonePermission", "granted");
        setStream(stream);
        stream.getTracks()[0].stop();
      } catch (error) {
        console.error("Error requesting microphone permission:", error);
      }
    };

    handlePermission();
  }, []);

  useEffect(() => {
    if (!isListening) {
      // check if the mediaRecorder is running
      if (mediaRecorder !== null) {
        mediaRecorder.stop();
      }
    } else {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      // Call your function here with the updated note value
      handleUpdateNoteDetails();
    }, 750);

    return () => clearTimeout(timer); // Clear the timer if the component unmounts or note changes
  }, [note]);

  // Our GPT Prompt
  async function processMessageToChatGPT(message, max_tokens) {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    // console.log(token)
    const response = await fetch(current + "gpt/" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        userId: userId,
        message: message,
        max_tokens: max_tokens,
      }),
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
  };

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
  };

  const addNote = async (title) => {
    if (!note) return; // if there is no transcript, aka no words, then do nothing
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    // console.log(token)
    const response = await fetch(current + "addNote/" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      //credentials: 'include',
      body: JSON.stringify({
        userId: userId,
        title: title,
        content: note,
        tags: tags,
      }),
    });

    if (!response.ok) {
      console.error(response.statusText);
    } else {
      await sendTags();
      setNote(" ");
      setUserTitle("");
      setTags([]);
    }
    setMode("");
  };

  // Add tags to the note previously add, this is called by addNote
  const sendTags = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const response = await fetch(current + "addTags/" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        tags: tags,
        userId: userId,
      }),
    });
  };

  const handleStartRecording = async () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setMediaRecorder(recorder);
    });
    setMode("Journal");
  };

  const handleStopRecording = async (blob) => {
    // console.log('handleStopRecording')
    if (blob.size === 0) {
      return;
    }

    const formData = new FormData();
    formData.append("audio", blob, "audio.mp3");

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      const response = await fetch(current + "transcribe/" + userId, {
        method: "POST",
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // console.log('here')
      const data = await response.json();
      const transcript = data.transcription;
      setNote(data.transcription);
      stoppedListeningFunction(transcript);
    } catch (error) {
      console.log("Error:", error.message);
    }

    chunksRef.current = [];
  };

  const handleFileUpload = async (event) => {
    if (event.target.files.length === 0) return;

    handleTimerChange(false);
    setLoad(true);
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      const headers = new Headers();
      headers.append("Authorization", `${token}`);
      const response = await fetch(current + "transcribe/" + userId, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setNote(data.transcription);
        stoppedListeningFunction(data.transcription);
      } else {
        console.log("An error occurred during transcription.");
        handleTimerChange(false);
        setLoad(false);
      }
    } catch (error) {
      console.log(error);
      handleTimerChange(false);
      setLoad(false);
      setMode("");
    }
  };

  const handleDiscardClick = async (event) => {
    event.preventDefault();
    if (isListening) {
      setIsListening(false);
    }
    setUserTitle("");
    setNote("");
    setTags([]);
    setSeconds(0);
    setShowNote(false);
    setAudioBlob(null);
    setChunks([]);
    setMode("");
  };

  // When mic is clicked, this is run
  const handleListenChange = async () => {
    // const prev = note;
    setIsListening((prevState) => !prevState); // This lags 1 cycle, bc its async

    // When the mic is listening, isListening will be false within this function
    if (!isListening) {
      handleTimerChange(true);
    } else {
      handleTimerChange(false);
      setLoad(true);
      setMode("Journal");
    }
  };

  // Timer that is shown when recording.
  const handleTimerChange = (state) => {
    if (state) {
      setTimerInterval(
        setInterval(() => {
          setSeconds((seconds) => seconds + 1);
        }, 1000)
      );
    } else {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const stoppedListeningFunction = async (note) => {
    await getTags(note);
    await getGPTTitle(note);
    setLoad(false);
    if (!note) {
      setSeconds(0);
    } else {
      setShowNote(true);
    }
  };

  const handleUpdateNoteDetails = () => {
    getTags(note);
    getGPTTitle(note);
  };

  function cleanTitle(title) {
    // Remove leading and trailing double quotes
    title = title.replace(/^"(.*)"$/, "$1");

    // Remove trailing period
    title = title.replace(/\.$/, "");

    return title;
  }

  // GPT prompt for Title
  const getGPTTitle = async (note) => {
    if (!note.trim()) {
      setUserTitle("");
      return;
    }
    const title = await processMessageToChatGPT(
      "Return a 3 word title for this following note: " + note,
      20
    );
    const formattedTitle = cleanTitle(title);
    setUserTitle(formattedTitle);
    return formattedTitle;
  };

  // Get the user tags from the database.
  const getUserTags = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const response = await fetch(current + "getUserTags/" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    const tags = await response.json();
    return tags;
  };

  // Get tags to assign to each new note.
  const getTags = async (note1) => {
    if (!note1.trim()) {
      setTags([]);
      return [];
    } else {
      const currentTags = await getUserTags();
      const preTags = await processMessageToChatGPT(
        "Return a 3 individual keywords separated by commas that are related to this note: " +
          note1 +
          ". If any of these keywords are applicable, use them: " +
          currentTags,
        20
      );
      const Tags = preTags.replace(/"/g, "");
      const arr = Tags.split(", ");
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
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };

  const deleteTag = (option) => {
    if (tags.includes(option)) {
      setTags(tags.filter((tags) => tags !== option));
    }
  };

  const addTag = (event) => {
    if (event.target.value.trim()) {
      const tag = event.target.value;
      setTags([...tags, tag]);
    }
    event.target.value = ""; // Clear the input field after adding the tag
  };

  const adjustInputWidth = (event) => {
    event.target.style.width = 1 + event.target.value.length + "ch";
  };

  // const handleKeyDown = (event) => {
  //   if (event.key === "Enter") {
  //     addTag(event);
  //   }
  // };

  // SEARCH CODE STARTS HERE

  // const [load, setLoad] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [queryResponse, setQueryResponse] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [numQueries, setNumQueries] = useState();
  const [showSuggest, setShowSuggest] = useState(true);

  const [userTags, setUserTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // const fetchNumQueries = async () => {
  //   const userId = localStorage.getItem("userId");
  //   const token = localStorage.getItem("token");
  //   const response = await fetch(current + "fetchNumQueries/" + userId, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `${token}`,
  //     },
  //     body: JSON.stringify({ userId }),
  //   });
  //   const data = await response.json();
  //   const num_queries = parseInt(data, 10);
  //   setNumQueries(num_queries);
  // };

  useEffect(() => {
    // fetchNumQueries();
    const savedMessages = JSON.parse(localStorage.getItem("messages"));
    if (savedMessages !== null) {
      setMessages(savedMessages);
    }
  }, [session]);

  const incrNumQueries = async () => {
    return;
    // // const userId = session.data.session.access_token;
    // const userId = localStorage.getItem("userId");
    // // console.log("data is " + session.data.session)
    // // console.log("userid in incrnumquerires is" + userId)
    // const token = localStorage.getItem("token");
    // const response = await fetch(current + "incrNumQueries/" + userId, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `${token}`,
    //   },
    //   body: JSON.stringify({ userId }),
    // });
  };

  const sendQuestion = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    setLoad(true);
    setMode("Reflect");

    const userMessage = { text: searchTerm, role: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setSearchTerm("");
    setShowSuggest(false);
    incrNumQueries();
  };

  // This waits for messages var to be updated before sending the request to backend
  useEffect(() => {
    const fetchData = async () => {
      if (load) {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        // console.log(token);
        const response = await fetch(current + "queryUserThoughts/" + userId, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ userId, messages }),
        });
        console.log(response);
        const gptResponse = await response.json();
        const botMessage = { text: gptResponse, role: "assistant" };

        setLoad(false);
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setQueryResponse(gptResponse);
        localStorage.setItem(
          "messages",
          JSON.stringify([...messages, botMessage])
        );
      }
    };

    fetchData();
  }, [messages]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (showNote) {
        addTag(event);
      } else {
        sendQuestion();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askSuggested = async (question) => {
    setSearchTerm(question);
  };

  const clearMessages = () => {
    localStorage.removeItem("messages");
    setMessages([]);
    setShowSuggest(true);
    setMode("");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-[100vw] items-center justify-between overflow-hidden">
      <span
        className={
          mode == "Journal" || mode == "" ? "inherit-all h-fit" : "hidden"
        }
      >
        <div className={styles.titleDesc}>
          <h2 className={showNote ? styles.hidden : ""}>Record a thought</h2>
          <p
            className={`${styles.description} ${showNote ? styles.hidden : ""}`}
          >
            Click the mic below to get started! <br /> We will transcribe your
            thought into clear text
          </p>
        </div>
        <div className={styles.micContainer}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleListenChange}
            className={`${
              isListening ? styles.micButtonActive : styles.micButton
            } ${showNote ? styles.hidden : ""}`}
          >
            {isListening ? (
              <Img.StopIcon />
            ) : load ? (
              <div className={load ? styles.loading : styles.hidden}>
                <img src={Img.LoadingGif} alt="Wait for it!" height="100" />
                <p>Transcribing...</p>
              </div>
            ) : (
              <Img.MicIcon />
            )}
            <p
              className={
                isListening
                  ? `${styles.timer} ${"gradientText1"}`
                  : styles.hidden
              }
            >
              {seconds}s
            </p>
          </motion.button>
        </div>
        <div className={showNote ? styles.thoughtCard : styles.hidden}>
          <input
            value={userTitle}
            onChange={handleTitleChange}
            placeholder="Thought Title"
            className={styles.thoughtTitle}
          />
          <textarea
            value={note}
            onChange={handleInputChange}
            placeholder="Your thought here..."
            className={styles.transcript}
          />
          <div className={styles.tagList}>
            Tags:
            {tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button
                  onClick={() => {
                    deleteTag(tag);
                  }}
                  className={styles["clear-btn"]}
                >
                  &times;
                </button>
              </span>
            ))}
            {tags.length < 3 ? (
              <input
                tabIndex={100}
                onBlur={addTag}
                onKeyDown={handleKeyDown}
                placeholder="Add Tag +"
                className={styles.addTag}
                onInput={adjustInputWidth}
              />
            ) : (
              ""
            )}
          </div>
          <div className={styles.thoughtActionMenu}>
            <button
              onClick={handleDiscardClick}
              className={styles.thoughtActionButton1}
            >
              Discard
            </button>
            <div className={styles.roundedGradientBorder}>
              <button
                onClick={handleCommitClick}
                className={styles.thoughtActionButton2}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div
          className={
            showNote || load ? styles.hidden : styles.altOptionsWrapper
          }
        >
          <p className={styles.description}>OR</p>
          <div className="flex flex-row gap-4">
            <motion.label
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              htmlFor="fileInput"
              className={styles.uploadButton}
            >
              <Img.UploadIcon />
            </motion.label>
            <input
              type="file"
              id="fileInput"
              accept="audio/mpeg, audio/wav, audio/ogg, audio/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNote(true)}
              className={styles.writeButton}
            >
              <Img.WriteIcon />
            </motion.button>
          </div>
        </div>
        <div style={{ display: "block" }}>
          <span onClick={() => setConfirmation(false)}>
            <motion.button
              variants={popUpTransitions}
              initial="hidden"
              animate={confirmation ? "visible" : "fadeOut"}
              exit="exit"
              transition={{ duration: 0.2, delay: 1.0 }}
              className={styles.confirmationPopup}
            >
              <p>Saved</p>
            </motion.button>
          </span>
        </div>
      </span>
      <span
        className={
          mode == "Reflect" || mode == "" ? "inherit-all h-fit" : "hidden"
        }
      >
        {/* <div className={showSuggest ? styles.suggestList : styles.hidden}>
            <button
              onClick={() => askSuggested("Summarize this week's thoughts")}
              className={styles.suggestQuestion}
            >
              Summarize this week's thoughts
            </button>
            <button
              onClick={() => askSuggested("What do I talk about most?")}
              className={styles.suggestQuestion}
            >
              What do I talk about most?
            </button>
            <button
              onClick={() => askSuggested("I'm bored, what should I do?")}
              className={styles.suggestQuestion}
            >
              I'm bored, what should I do?
            </button>
          </div> */}
        {mode == "Reflect" ? (
          <div className={styles.chatHistory}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role == "user"
                    ? styles.userQuestion
                    : styles.memoriaResponse
                }
              >
                {message.text}
              </div>
            ))}
            <div className={load ? styles.loading2 : styles.hidden}>
              <img height="50" src={Img.LoadingGif} alt="Wait for it!" />
            </div>
            <div ref={messagesEndRef} />
          </div>
        ) : (
          ""
        )}
        <div className="flex flex-row fixed bottom-0 gap-4 w-full md:w-2/3 md:min-w-[600px] p-4 bg-[#161616] border-2 border-white/5 rounded-t-3xl z-50">
          <div className={`${"w-full pr-4"} ${styles.roundedGradientBorder}`}>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={""}
              placeholder="Or Reflect on your past here..."
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendQuestion} className={styles.mobileQuerySend}>
              <Img.SendIcon />
            </button>
          </div>
          <div className={styles.roundedGradientBorder}>
            <button
              onClick={() => clearMessages()}
              className={styles.suggestQuestion}
            >
              <Img.TrashGradient />
            </button>
          </div>
        </div>
      </span>
    </div>
  );
};

export default Main;
