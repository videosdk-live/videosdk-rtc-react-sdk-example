import { useContext, createContext, useState, useEffect, useRef } from "react";

export const MeetingAppContext = createContext();

export const useMeetingAppContext = () => useContext(MeetingAppContext);

export const MeetingAppProvider = ({ children }) => {
  const [selectedMic, setSelectedMic] = useState({ id: null, label: null });
  const [selectedWebcam, setSelectedWebcam] = useState({
    id: null,
    label: null,
  });
  const [selectedSpeaker, setSelectedSpeaker] = useState({
    id: null,
    label: null,
  });
  const [isCameraPermissionAllowed, setIsCameraPermissionAllowed] =
    useState(null);
  const [isMicrophonePermissionAllowed, setIsMicrophonePermissionAllowed] =
    useState(null);
  const [raisedHandsParticipants, setRaisedHandsParticipants] = useState([]);
  const [sideBarMode, setSideBarMode] = useState(null);
  const [pipMode, setPipMode] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);

  const wsRef = useRef();
  const streamRef = useRef();
  const mediaRecorderRef = useRef();

  const cleanupConnections = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, "Normal Closure");
    }
    wsRef.current = null;
    mediaRecorderRef.current = null;
    streamRef.current = null;
    setIsTranscribing(false);
  };

  const startTranscription = async () => {
    setTranscript("");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!stream) {
        setError("Could not get user audio");
        return;
      }
      streamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      console.log("Sample rate:", audioTrack.getSettings().sampleRate);

      wsRef.current = new WebSocket("ws://localhost:3001/transcribe");
      wsRef.current.binaryType = "arraybuffer";

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsTranscribing(true);

        try {
          mediaRecorderRef.current = new MediaRecorder(stream, {
            mimeType: "audio/webm; codecs=opus",
          });
        } catch (err) {
          console.error("MediaRecorder creation failed:", err);
          setError("MediaRecorder creation failed. Try a different mimeType?");
          cleanupConnections();
          return;
        }

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(e.data);
          }
        };

        mediaRecorderRef.current.onerror = (err) => {
          console.error("MediaRecorder error:", err);
          setError("Recording error: " + err.message);
          cleanupConnections();
        };

        mediaRecorderRef.current.start(250);
        console.log("MediaRecorder started");
      };

      wsRef.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("WebSocket error. Check console/logs.");
        cleanupConnections();
      };

      wsRef.current.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);

          if (data.error) {
            console.error("Server error:", data.error);
            setError(data.error);
          } else if (data.channel?.alternatives?.[0]?.transcript) {
            const partial = data.channel.alternatives[0].transcript;
            setTranscript(partial);
          }
        } catch (err) {
          console.error("Error parsing server message:", err);
        }
      };

      wsRef.current.onclose = (evt) => {
        console.log("WebSocket closed:", evt.code, evt.reason);
        cleanupConnections();
      };
    } catch (err) {
      console.error("getUserMedia error:", err);
      setError("Failed to access microphone. Check permissions or HTTPS");
      cleanupConnections();
    }
  };

  const stopTranscription = () => {
    cleanupConnections();
  };

  const useRaisedHandParticipants = () => {
    const raisedHandsParticipantsRef = useRef();

    const participantRaisedHand = (participantId) => {
      const raisedHandsParticipants = [...raisedHandsParticipantsRef.current];

      const newItem = { participantId, raisedHandOn: new Date().getTime() };

      const participantFound = raisedHandsParticipants.findIndex(
        ({ participantId: pID }) => pID === participantId
      );

      if (participantFound === -1) {
        raisedHandsParticipants.push(newItem);
      } else {
        raisedHandsParticipants[participantFound] = newItem;
      }

      setRaisedHandsParticipants(raisedHandsParticipants);
    };

    useEffect(() => {
      raisedHandsParticipantsRef.current = raisedHandsParticipants;
    }, [raisedHandsParticipants]);

    const _handleRemoveOld = () => {
      const raisedHandsParticipants = [...raisedHandsParticipantsRef.current];

      const now = new Date().getTime();

      const persisted = raisedHandsParticipants.filter(({ raisedHandOn }) => {
        return parseInt(raisedHandOn) + 15000 > parseInt(now);
      });

      if (raisedHandsParticipants.length !== persisted.length) {
        setRaisedHandsParticipants(persisted);
      }
    };

    useEffect(() => {
      const interval = setInterval(_handleRemoveOld, 1000);

      return () => {
        clearInterval(interval);
      };
    }, []);

    return { participantRaisedHand };
  };

  return (
    <MeetingAppContext.Provider
      value={{
        // states

        raisedHandsParticipants,
        selectedMic,
        selectedWebcam,
        selectedSpeaker,
        sideBarMode,
        pipMode,
        isCameraPermissionAllowed,
        isMicrophonePermissionAllowed,
        isTranscribing,
        transcript,

        // setters

        setRaisedHandsParticipants,
        setSelectedMic,
        setSelectedWebcam,
        setSelectedSpeaker,
        setSideBarMode,
        setPipMode,
        useRaisedHandParticipants,
        setIsCameraPermissionAllowed,
        setIsMicrophonePermissionAllowed,
        setIsTranscribing,
        setTranscript,
        startTranscription,
        stopTranscription,
      }}
    >
      {children}
    </MeetingAppContext.Provider>
  );
};
