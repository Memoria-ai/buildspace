const Create = ({ session }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const local = "http://localhost:8000/";
  const server = "https://memoria-ai.herokuapp.com/";
  const current = local;
  const [showNote, setShowNote] = useState(false);
  const [load, setLoad] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [chunks, setChunks] = useState([]);

  useEffect(() => {
    if (isListening) {
      handleStartRecording();
    } else {
      if (mediaRecorder !== null) {
        handleStopRecording();
      }
    }
  }, [isListening]);

  useEffect(() => {
    if (mediaRecorder !== null) {
      mediaRecorder.addEventListener("dataavailable", (event) => {
        setChunks((prev) => prev.concat(event.data));
      });
      mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
      });
    }
  });

  const handleStartRecording = () => {
    setIsListening(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setMediaRecorder(recorder);
    });
  };
  const handleStopRecording = async () => {
    setIsListening(false);
    mediaRecorder.stop();

    const audioBlob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    console.log(formData);
    try {
      const response = await fetch(`${current}audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setNote(data.text);
    } catch (error) {
      console.log(error.data.error);
    }
  };

  // MOVE to backend
  const handleListenChange = async () => {
    if (showNote) {
      setShowNote(false);
    }
    //why but ok ig
    setIsListening((prevState) => !prevState);
    console.log("handling listen change");

    if (isListening) {
      handleTimerChange(true);
      setLoad(true);
      await getGPTTitle();
      await getTags();
      setLoad(false);
      setShowNote(true);
      console.log("here");
    } else {
      handleTimerChange(false);
      if (seconds != 0) {
        setSeconds(0);
      }
    }
  };

  const handleTimerChange = (state) => {
    if (!state) {
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

  return (
    <div className={styles.body}>
      <h2>Click the mic to record your thoughts!</h2>
      <div>
        <button
          onClick={handleListenChange}
          className={isListening ? styles.micButtonActive : styles.micButton}
        >
          {isListening ? <Img.StopIcon /> : <Img.MicIcon />}{" "}
          <p className={styles.timer}>{seconds}s</p>
        </button>
      </div>
      <div className={load ? styles.loading : styles.hidden}>
        <img src={Img.LoadingGif} alt="Wait for it!" height="100" />
      </div>
    </div>
  );
};

export default Create;
