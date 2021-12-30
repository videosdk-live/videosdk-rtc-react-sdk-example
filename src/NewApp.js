import React, { useEffect, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
  useConnection,
} from "@videosdk.live/react-sdk";

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

// const MeetingChat = ({ tollbarHeight }) => {
//   const { sendChatMessage, messages } = useMeeting();
//   const [message, setMessage] = useState("");

//   return (
//     <div
//       style={{
//         marginLeft: borderRadius,
//         width: 400,
//         backgroundColor: primary,
//         overflowY: "scroll",
//         borderRadius,
//         height: `calc(100vh - ${tollbarHeight + 2 * borderRadius}px)`,
//         padding: borderRadius,
//       }}
//     >
//       <Title title={"Chat"} />

//       <div style={{ display: "flex" }}>
//         <input
//           value={message}
//           onChange={(e) => {
//             const v = e.target.value;
//             setMessage(v);
//           }}
//         />
//         <button
//           className={"button default"}
//           onClick={() => {
//             const m = message;

//             if (m.length) {
//               sendChatMessage(m);

//               setMessage("");
//             }
//           }}
//         >
//           Send
//         </button>
//       </div>
//       <div>
//         {messages?.map((message, i) => {
//           const { senderId, senderName, text, timestamp } = message;

//           return (
//             <div
//               style={{
//                 margin: 8,
//                 backgroundColor: "darkblue",
//                 borderRadius: 8,
//                 overflow: "hidden",
//                 padding: 8,
//                 color: "#fff",
//               }}
//               key={i}
//             >
//               <p style={{ margin: 0, padding: 0, fontStyle: "italic" }}>
//                 {senderName}
//               </p>
//               <h3 style={{ margin: 0, padding: 0, marginTop: 4 }}>{text}</h3>
//               <p
//                 style={{
//                   margin: 0,
//                   padding: 0,
//                   opacity: 0.6,
//                   marginTop: 4,
//                 }}
//               >
//                 {formatAMPM(new Date(parseInt(timestamp)))}
//               </p>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

function MeetingView() {
  const [participantViewVisible, setParticipantViewVisible] = useState(true);

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
  const onLiveStreamStarted = (data) => {
    console.log("onLiveStreamStarted example", data);
  };
  const onLiveStreamStopped = (data) => {
    console.log("onLiveStreamStopped example", data);
  };

  const onVideoStateChanged = (data) => {
    console.log("onVideoStateChanged", data);
  };
  const onVideoSeeked = (data) => {
    console.log("onVideoSeeked", data);
  };

  const onWebcamRequested = (data) => {
    console.log("onWebcamRequested", data);
  };
  const onMicRequested = (data) => {
    console.log("onMicRequested", data);
  };
  const onPinStateChanged = (data) => {
    console.log("onPinStateChanged", data);
  };

  const {
    meetingId,
    meeting,
    localParticipant,
    mainParticipant,
    activeSpeakerId,
    participants,
    presenterId,
    localMicOn,
    localWebcamOn,
    localScreenShareOn,
    messages,
    isRecording,
    isLiveStreaming,
    pinnedParticipants,
    //
    join,
    leave,
    end,
    //
    startRecording,
    stopRecording,
    //
    sendChatMessage,
    respondEntry,
    //
    muteMic,
    unmuteMic,
    toggleMic,
    //
    disableWebcam,
    enableWebcam,
    toggleWebcam,
    //
    disableScreenShare,
    enableScreenShare,
    toggleScreenShare,
    //
    getMics,
    getWebcams,
    changeWebcam,
    changeMic,

    startVideo,
    stopVideo,
    resumeVideo,
    pauseVideo,
    seekVideo,
    startLivestream,
    stopLivestream,
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
    onLiveStreamStarted,
    onLiveStreamStopped,
    onVideoStateChanged,
    onVideoSeeked,
    onWebcamRequested,
    onMicRequested,
    onPinStateChanged,
  });

  const handlestartVideo = () => {
    console.log("handlestartVideo");

    startVideo({
      link: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    });
  };
  const handlestopVideo = () => {
    stopVideo();
  };
  const handleresumeVideo = () => {
    resumeVideo();
  };
  const handlepauseVideo = () => {
    pauseVideo({ currentTime: 2 });
  };
  const handlesseekVideo = () => {
    seekVideo({ currentTime: 5 });
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
        <button className={"button blue"} onClick={handleresumeVideo}>
          resumeVideo
        </button>
        <button className={"button blue"} onClick={handlepauseVideo}>
          pauseVideo
        </button>
        <button className={"button blue"} onClick={handlesseekVideo}>
          seekVideo
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
        <button
          className={"button blue"}
          onClick={() => setParticipantViewVisible((s) => !s)}
        >
          Switch to {participantViewVisible ? "Connections" : "Participants"}{" "}
          view
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
          {/* <ExternalVideo /> */}
          {/* <ParticipantsView /> */}
          {/* {participantViewVisible ? <ParticipantsView /> : <ConnectionsView />} */}
        </div>
        {/* <MeetingChat tollbarHeight={tollbarHeight} /> */}
      </div>
    </div>
  );
}

export default function NewApp() {
  // const ONE_MEETING = "dt6d-a3i8-wpcx";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIxYTgyNjA2YS02MjcyLTQzZWItODZiYy0xYjE1OWM1ZDE2MWIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTYzOTQ4MDc0M30.NevyWx8214tCtUt8Ka7hcdt5BiMiIZjODccmi_0X6dY";

  const [meetingId, setMeetingId] = useState(null);

  const getMeetingAndToken = async () => {
    const meetingId = prompt("please enter meeting id");

    setMeetingId(meetingId);
  };

  useEffect(getMeetingAndToken, []);

  return token && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
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
}
