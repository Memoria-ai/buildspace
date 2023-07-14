import React, { useState, useEffect, useRef } from "react";
import Account from "../Account/Account";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import styles from "./Main.module.css";
import * as Img from "../../imgs";
import { motion } from "framer-motion";
import Nav from "../../components/Nav/Nav";

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

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      navigate("/");
    }

    // getJournalPrompt();
  }, []);

  useEffect(() => {
    if (mode == "Journal") {
      setLoad(false);
    }
    getJournalPrompt();
  }, [mode]);

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

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     // Call your function here with the updated note value
  //     handleUpdateNoteDetails();
  //   }, 750);

  //   return () => clearTimeout(timer); // Clear the timer if the component unmounts or note changes
  // }, [note]);

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
    if (!note.trim()) {
      setSeconds(0);
      setMode("");
    } else {
      await getTags(note);
      await getGPTTitle(note);
      await getCleanTranscript(note);
      setLoad(false);
      setShowNote(true);
    }
  };

  // const handleUpdateNoteDetails = () => {
  //   getTags(note);
  //   getGPTTitle(note);
  // };

  function cleanTitle(title) {
    // Remove leading and trailing double quotes
    title = title.replace(/^"(.*)"$/, "$1");

    // Remove trailing period
    title = title.replace(/\.$/, "");

    return title;
  }

  // GPT prompt for Title
  const getGPTTitle = async (note) => {
    const title = await processMessageToChatGPT(
      "Return a 3 word title for this following note: " + note,
      20
    );
    const formattedTitle = cleanTitle(title);
    setUserTitle(formattedTitle);
    return formattedTitle;
  };

  const getCleanTranscript = async (note) => {
    const transcript = await processMessageToChatGPT(
      "This is a transcript for a voice recording. Without losing detail\
      or changing content matter, return a better written, and coherent version\
      of the transcript. If it is appropriate, use line breaks to make it look more organized:" +
        note,
      200
    );
    setNote(transcript);
    return transcript;
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
    visible: { opacity: 1, transition: { duration: 1.0 } },
    fadeOut: { opacity: 0, transition: { duration: 1.0 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
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

  useEffect(() => {
    // fetchNumQueries();
    const savedMessages = JSON.parse(localStorage.getItem("messages"));
    if (savedMessages !== null) {
      setMessages(savedMessages);
    }
  }, [session]);

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
  };

  // This waits for messages var to be updated before sending the request to backend
  useEffect(() => {
    const fetchData = async () => {
      if (load) {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
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
  }, [messages, mode]);

  const askSuggested = async (question) => {
    setSearchTerm(question);
  };

  const clearMessages = () => {
    localStorage.removeItem("messages");
    setMessages([]);
    setShowSuggest(true);
    setMode("");
  };

  const [journalPrompt, setJournalPrompt] = useState(
    "Tell me about your day. The highs & the lows."
  );

  const getJournalPrompt = async () => {
    const prompt =
      mode == "Reflect"
        ? "Return an interesting, introspective, one sentence (count the words, 12 words maximum, 5 word minimum) question for self-reflection in first person."
        : mode == "Journal"
        ? "Return an interesting, introspective, one sentence (count the words, 12 words maximum, 5 word minimum) journalling prompt that focuses on reflecting on your day for long daily journalling."
        : "Return an interesting one sentence (count the words, 12 words maximum, 5 word minimum) journalling prompt that focuses on reflecting on your day for long daily journalling.";
    console.log(prompt);
    const genJournal = await processMessageToChatGPT(prompt, 20);
    setJournalPrompt(genJournal);
  };

  useEffect(() => {
    if (mode == "Reflect") {
      getJournalPrompt();
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[100dvh] w-[100vw] items-center overflow-hidden noise-gradient-background">
      <Nav
        onClick={() => setMode((prevState) => !prevState)}
        session={session}
        mode={mode}
      />
      <motion.div
        variants={popUpTransitions}
        initial="visible"
        animate={mode !== "Reflect" ? "visible" : "fadeOut"}
        exit="exit"
        transition={{ duration: 1.5, delay: 0.5 }}
        className={
          mode == "Journal" || mode == ""
            ? "flex flex-col h-fit w-[100vw] items-center justify-between pt-8 md:pt-16 md:gap-8 gap-4"
            : "hidden"
        }
      >
        <div
          className={showNote ? "hidden" : "flex flex-col leading-none gap-2"}
        >
          <h2 className="text-5xl font-bold gradientText1 w-fit self-center">
            Journal
          </h2>
          <p className="text-center font-semibold text-[#999999] tracking-tight">
            Click the mic to clear your mind
          </p>
        </div>
        <span className="grey-gradient-border w-4/5 md:w-1/2 h-[5rem] flex items-center text-center justify-center">
          <p className="text-[#999999] w-4/5 text-sm md:text-lg">
            {journalPrompt}
          </p>
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleListenChange}
          className={`${
            isListening ? styles.micButtonActive : styles.micButton
          } ${showNote ? "hidden" : ""}`}
        >
          {isListening ? (
            <Img.StopIcon />
          ) : load ? (
            <div className={load ? styles.loading : "hidden"}>
              <img src={Img.LoadingGif} alt="Wait for it!" height="100" />
              <p>Transcribing...</p>
            </div>
          ) : (
            <Img.MicIcon />
          )}
          <p
            className={
              isListening ? "absolute bottom-6 text-white" : styles.hidden
            }
          >
            {seconds}s
          </p>
        </motion.button>
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
            showNote || load ? "hidden" : "flex flex-col gap-2 fixed bottom-28"
          }
        >
          <p className="text-sm self-center text-[#999999]">OR</p>
          <div className="flex flex-row gap-2">
            <motion.label
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              htmlFor="fileInput"
              className={styles.altOption}
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
              className={styles.altOption}
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
      </motion.div>
      <span
        className={
          mode == "Reflect" || mode == ""
            ? "flex flex-col w-[100vw] items-center fixed bottom-0 justify-between h-[calc(100dvh-5.25rem)]"
            : "hidden"
        }
      >
        <motion.div
          variants={popUpTransitions}
          initial="hidden"
          animate={mode == "Reflect" ? "visible" : "fadeOut"}
          exit="exit"
          transition={{ duration: 0.5, delay: 0.5 }}
          className={
            mode == "Reflect"
              ? "grey-gradient-border w-4/5 md:w-1/2 h-[5rem] flex items-center text-center justify-center absolute top-0 z-40 cursor-pointer"
              : "hidden"
          }
          onClick={(e) => {
            e.preventDefault();
            setSearchTerm(journalPrompt);
          }}
        >
          <p className="text-[#999999] w-4/5 text-sm md:text-lg">
            {journalPrompt}
          </p>
        </motion.div>
        <span className="flex-1" />
        <button
          onClick={() => setMode((prevState) => !prevState)}
          className={
            mode == "Reflect"
              ? "md:flex hidden flex-row gap-2 px-4 py-2 absolute left-24 top-4 z-50"
              : "hidden"
          }
        >
          <Img.BackIcon />
          <p
            className={mode == "Reflect" ? "font-bold gradientText1" : "hidden"}
          >
            Back
          </p>
        </button>
        <motion.div
          variants={popUpTransitions}
          initial="hidden"
          animate={mode == "Reflect" ? "visible" : "fadeOut"}
          exit="exit"
          transition={{ duration: 0.5, delay: 0.5 }}
          className={styles.chatHistory}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role == "user"
                  ? styles.userQuestion
                  : styles.memoriaResponse
              }`}
            >
              {message.text}
            </div>
          ))}
          <div className={load ? styles.loading2 : styles.hidden}>
            <img height="50" src={Img.LoadingGif} alt="Wait for it!" />
          </div>
          <div ref={messagesEndRef} />
        </motion.div>
        <div className="flex flex-row gap-4 w-full md:w-1/2 md:min-w-[600px] p-4 pb-8 bg-[#27272725] border border-b-0 border-[#272727] rounded-t-3xl z-50">
          <div className={`${"w-full pr-4"} ${styles.roundedGradientBorder}`}>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={"h-10 font-semibold placeholder:text-[#999999]"}
              placeholder="Ask a question to Reflect on your past..."
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                e.preventDefault();
                setMode("Reflect");
              }}
              onBlur={(e) => {
                e.preventDefault();
                setTimeout(() => {
                  if (document.activeElement !== e.target) {
                    messages.length === 0 ? setMode("") : setMode("Reflect");
                  }
                }, 2000);
              }}
            />
            <button onClick={sendQuestion} className={styles.mobileQuerySend}>
              <Img.SendIcon />
            </button>
          </div>
          <div
            className={
              mode == "Reflect" ? styles.roundedGradientBorder : "hidden"
            }
          >
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
