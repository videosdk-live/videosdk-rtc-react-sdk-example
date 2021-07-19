import React, { useEffect, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { getToken, validateMeeting } from "./api";

const primary = "#3E84F6";

const width = 400;
const height = (width * 2) / 3;
const borderRadius = 8;

const chunk = (arr) => {
  const newArr = [];
  while (arr.length) newArr.push(arr.splice(0, 3));
  return newArr;
};

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

const Title = ({ title, dark }) => {
  return <h2 style={{ color: dark ? primary : "#fff" }}>{title}</h2>;
};

const ExternalVideo = () => {
  const { externalVideo } = useMeeting();
  const externalPlayer = useRef();

  useEffect(() => {
    if (externalPlayer.current) {
      externalPlayer.current.currentTime = externalVideo.currentTime;
    }
  }, [externalVideo]);

  return (
    <div
      style={{
        borderRadius,
        padding: borderRadius,
        margin: borderRadius,
        backgroundColor: primary,
        display: "flex",
      }}
    >
      <Title title={"Externam Video"} />

      <video
        style={{ borderRadius, height, width, backgroundColor: "black" }}
        autoPlay
        ref={externalPlayer}
        src={externalVideo.link}
      />
    </div>
  );
};

const MeetingChat = ({ tollbarHeight }) => {
  const { sendChatMessage, messages } = useMeeting();
  const [message, setMessage] = useState("");

  return (
    <div
      style={{
        marginLeft: borderRadius,
        width: 400,
        backgroundColor: primary,
        overflowY: "scroll",
        borderRadius,
        height: `calc(100vh - ${tollbarHeight + 2 * borderRadius}px)`,
        padding: borderRadius,
      }}
    >
      <Title title={"Chat"} />

      <div style={{ display: "flex" }}>
        <input
          value={message}
          onChange={(e) => {
            const v = e.target.value;
            setMessage(v);
          }}
        />
        <button
          className={"button default"}
          onClick={() => {
            const m = message;

            if (m.length) {
              sendChatMessage(m);

              setMessage("");
            }
          }}
        >
          Send
        </button>
      </div>
      <div>
        {messages?.map((message, i) => {
          const { senderId, senderName, text, timestamp } = message;

          return (
            <div
              style={{
                margin: 8,
                backgroundColor: "darkblue",
                borderRadius: 8,
                overflow: "hidden",
                padding: 8,
                color: "#fff",
              }}
              key={i}
            >
              <p style={{ margin: 0, padding: 0, fontStyle: "italic" }}>
                {senderName}
              </p>
              <h3 style={{ margin: 0, padding: 0, marginTop: 4 }}>{text}</h3>
              <p
                style={{
                  margin: 0,
                  padding: 0,
                  opacity: 0.6,
                  marginTop: 4,
                }}
              >
                {formatAMPM(new Date(parseInt(timestamp)))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ParticipantView = ({ participantId }) => {
  const webcamRef = useRef(null);
  const micRef = useRef(null);
  const screenShareRef = useRef(null);

  const onStreamEnabled = (stream) => {};
  const onStreamDisabled = (stream) => {};

  const {
    displayName,
    webcamStream,
    micStream,
    screenShareStream,
    webcamOn,
    micOn,
    screenShareOn,
    isLocal,
    isActiveSpeaker,
    isMainParticipant,
  } = useParticipant(participantId, {
    onStreamEnabled,
    onStreamDisabled,
  });

  useEffect(() => {
    if (webcamRef.current) {
      if (webcamOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);

        webcamRef.current.srcObject = mediaStream;
        webcamRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        webcamRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  useEffect(() => {
    if (screenShareRef.current) {
      if (screenShareOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(screenShareStream.track);

        screenShareRef.current.srcObject = mediaStream;
        screenShareRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        screenShareRef.current.srcObject = null;
      }
    }
  }, [screenShareStream, screenShareOn]);

  return (
    <div
      style={{
        width,
        backgroundColor: primary,
        borderRadius: borderRadius,
        overflow: "hidden",
        margin: borderRadius,
        padding: borderRadius,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        position: "relative",
      }}
    >
      <audio ref={micRef} autoPlay />

      <div
        style={{
          position: "relative",
          borderRadius: borderRadius,
          overflow: "hidden",
          backgroundColor: "pink",
          width: "100%",
          height: 300,
        }}
      >
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <video
            height={"100%"}
            width={"100%"}
            ref={webcamRef}
            style={{
              backgroundColor: "black",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              objectFit: "contain",
            }}
            autoPlay
          />
          <div
            style={{
              position: "absolute",
              top: borderRadius,
              right: borderRadius,
            }}
          >
            <p
              style={{
                color: webcamOn ? "green" : "red",
                fontSize: 16,
                fontWeight: "bold",
                opacity: 1,
              }}
            >
              WEB CAM
            </p>
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: borderRadius,
          position: "relative",
          borderRadius: borderRadius,
          overflow: "hidden",
          backgroundColor: "lightgreen",
          width: "100%",
          height: 300,
        }}
      >
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <video
            height={"100%"}
            width={"100%"}
            ref={screenShareRef}
            style={{
              backgroundColor: "black",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              objectFit: "contain",
            }}
            autoPlay
          />
          <div
            style={{
              position: "absolute",
              top: borderRadius,
              right: borderRadius,
            }}
          >
            <p
              style={{
                color: screenShareOn ? "green" : "red",
                fontSize: 16,
                fontWeight: "bold",
                opacity: 1,
              }}
            >
              SCREEN SHARING
            </p>
          </div>
        </div>
      </div>
      <table>
        {[
          { k: "Name", v: displayName },
          { k: "webcamOn", v: webcamOn ? "YES" : "NO" },
          { k: "micOn", v: micOn ? "YES" : "NO" },
          { k: "screenShareOn", v: screenShareOn ? "YES" : "NO" },
          { k: "isLocal", v: isLocal ? "YES" : "NO" },
          { k: "isActiveSpeaker", v: isActiveSpeaker ? "YES" : "NO" },
          { k: "isMainParticipant", v: isMainParticipant ? "YES" : "NO" },
        ].map(({ k, v }) => (
          <tr key={k}>
            <td style={{ border: "1px solid #fff", padding: 4 }}>
              <h3 style={{ margin: 0, padding: 0, color: "#fff" }}>{k}</h3>
            </td>
            <td style={{ border: "1px solid #fff", padding: 4 }}>
              <h3 style={{ margin: 0, padding: 0, color: "#fff" }}>{v}</h3>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
};

const ParticipantsView = () => {
  const { participants } = useMeeting();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "column",
        padding: borderRadius,
      }}
    >
      <Title dark title={"Participants"} />
      {chunk([...participants.keys()]).map((k) => (
        <div style={{ display: "flex" }}>
          {k.map((l) => (
            <ParticipantView key={l} participantId={l} />
          ))}
        </div>
      ))}
    </div>
  );
};

function MeetingView() {
  function onParticipantJoined(participant) {
    console.log(" onParticipantJoined", participant);
  }
  function onParticipantLeft(participant) {
    console.log(" onParticipantLeft", participant);
  }
  const onSpeakerChanged = (activeSpeakerId) => {
    console.log(" onSpeakerChanged", activeSpeakerId);
  };
  function onPresenterChanged(presenterId) {
    console.log(" onPresenterChanged", presenterId);
  }
  function onMainParticipantChanged(participant) {
    console.log(" onMainParticipantChanged", participant);
  }
  function onEntryRequested(participantId, name) {
    console.log(" onEntryRequested", participantId, name);
  }
  function onEntryResponded(participantId, name) {
    console.log(" onEntryResponded", participantId, name);
  }
  function onRecordingStarted() {
    console.log(" onRecordingStarted");
  }
  function onRecordingStopped() {
    console.log(" onRecordingStopped");
  }
  function onChatMessage(data) {
    console.log(" onChatMessage", data);
  }
  function onMeetingJoined() {
    console.log("onMeetingJoined");
  }
  function onMeetingLeft() {
    console.log("onMeetingLeft");
  }
  const onLiveStreamstarted = (data) => {
    console.log("onLiveStreamstarted example", data);
  };
  const onLiveStreamStopped = (data) => {
    console.log("onLiveStreamStopped example", data);
  };
  const onVideoStarted = (data) => {
    console.log("onVideoStarted example", data);
  };
  const onVideoStopped = (data) => {
    console.log("onVideoStopped example", data);
  };

  const {
    // meetingId,
    meeting,
    // localParticipant,
    // mainParticipant,
    // activeSpeakerId,
    participants,
    isRecording,
    // presenterId,
    // localMicOn,
    // localWebcamOn,
    // localScreenShareOn,
    messages,
    //
    join,
    leave,

    startRecording,
    stopRecording,
    // //
    sendChatMessage,
    // respondEntry,

    toggleMic,
    toggleWebcam,

    toggleScreenShare,
    startVideo,
    stopVideo,
    startLivestream,
    stopLivestream,
    externalVideo,
    isLiveStreaming,
  } = useMeeting({
    onParticipantJoined,
    onParticipantLeft,
    onSpeakerChanged,
    onPresenterChanged,
    onMainParticipantChanged,
    onEntryRequested,
    onEntryResponded,
    onRecordingStarted,
    onRecordingStopped,
    onChatMessage,
    onMeetingJoined,
    onMeetingLeft,
    onLiveStreamstarted,
    onLiveStreamStopped,
    onVideoStarted,
    onVideoStopped,
  });

  console.log(externalVideo, "externalVideo");

  const handlestartVideo = () => {
    startVideo({
      link: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    });
  };

  const handlestopVideo = () => {
    stopVideo();
  };
  const handleStartLiveStream = () => {
    startLivestream([
      {
        url: "rtmp://a.rtmp.youtube.com/live2",
        streamKey: "key",
      },
    ]);
  };

  const handleStopLiveStream = () => {
    stopLivestream();
  };
  const handleStartRecording = () => {
    startRecording();
  };
  const handleStopRecording = () => {
    stopRecording();
  };

  const tollbarHeight = 60;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#D6E9FE",
      }}
    >
      <div style={{ height: tollbarHeight }}>
        <button className={"button blue"} onClick={join}>
          JOIN
        </button>
        <button className={"button red"} onClick={leave}>
          LEAVE
        </button>
        <button className={"button blue"} onClick={toggleMic}>
          toggleMic
        </button>
        <button className={"button blue"} onClick={toggleWebcam}>
          toggleWebcam
        </button>
        <button className={"button blue"} onClick={toggleScreenShare}>
          toggleScreenShare
        </button>
        <button className={"button blue"} onClick={handlestartVideo}>
          startVideo
        </button>
        <button className={"button blue"} onClick={handlestopVideo}>
          stopVideo
        </button>
        <button className={"button blue"} onClick={handleStartLiveStream}>
          Start Live Stream
        </button>
        <button className={"button blue"} onClick={handleStopLiveStream}>
          Stop Live Stream
        </button>
        <button className={"button blue"} onClick={handleStartRecording}>
          start recording
        </button>
        <button className={"button blue"} onClick={handleStopRecording}>
          stop recording
        </button>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            flex: 1,
            overflowY: "scroll",
            height: `calc(100vh - ${tollbarHeight}px)`,
          }}
        >
          <ExternalVideo />
          <ParticipantsView />
        </div>
        <MeetingChat tollbarHeight={tollbarHeight} />
      </div>
    </div>
  );
}

const App = () => {
  const [token, setToken] = useState(null);
  const [meetingId, setMeetingId] = useState(null);

  const getMeetingAndToken = async () => {
    const token = await getToken();
    const meetingId = await validateMeeting(token);

    setToken(token);
    setMeetingId(meetingId);
  };

  useEffect(getMeetingAndToken, []);

  return token && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: false,
        name: "Participant Name",
      }}
      token={token}
    >
      <MeetingConsumer
        {...{
          onParticipantJoined: (participant) => {
            console.log(" onParticipantJoined", participant);
          },
          onParticipantLeft: (participant) => {
            console.log(" onParticipantLeft", participant);
          },
          onSpeakerChanged: (activeSpeakerId) => {
            console.log(" onSpeakerChanged", activeSpeakerId);
          },
          onPresenterChanged: (presenterId) => {
            console.log(" onPresenterChanged", presenterId);
          },
          onMainParticipantChanged: (participant) => {
            console.log(" onMainParticipantChanged", participant);
          },
          onEntryRequested: (participantId, name) => {
            console.log(" onEntryRequested", participantId, name);
          },
          onEntryResponded: (participantId, name) => {
            console.log(" onEntryResponded", participantId, name);
          },
          onRecordingStarted: () => {
            console.log(" onRecordingStarted");
          },
          onRecordingStopped: () => {
            console.log(" onRecordingStopped");
          },
          onChatMessage: (data) => {
            console.log(" onChatMessage", data);
          },
          onMeetingJoined: () => {
            console.log("onMeetingJoined");
          },
          onMeetingLeft: () => {
            console.log("onMeetingLeft");
          },
        }}
      >
        {() => <MeetingView />}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <p>loading...</p>
  );
};

export default App;
