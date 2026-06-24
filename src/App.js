import { MeetingProvider, Constants } from "@videosdk.live/react-sdk";
import { useEffect } from "react";
import { useState } from "react";
import { MeetingAppProvider } from "./MeetingAppContextDef";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { JoiningScreen } from "./components/screens/JoiningScreen";
import { MeetingStoreBridge } from "./store/MeetingStoreBridge";

function App() {
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [customAudioStream, setCustomAudioStream] = useState(null);
  const [customVideoStream, setCustomVideoStream] = useState(null)
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  const [localParticipantMode, setLocalParticipantMode] = useState(Constants.modes.SEND_AND_RECV);

  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  useEffect(() => {
    if (isMobile) {
      window.onbeforeunload = () => {
        return "Are you sure you want to exit?";
      };
    }
  }, [isMobile]);

  return (
    <>
      <MeetingAppProvider>
        {isMeetingStarted ? (

          <MeetingProvider
            config={{
              meetingId,
              micEnabled: localParticipantMode === Constants.modes.SEND_AND_RECV ? micOn : false,
              webcamEnabled: localParticipantMode === Constants.modes.SEND_AND_RECV ? webcamOn : false,
              name: participantName ? participantName : "TestUser",
              multiStream: true,
              customCameraVideoTrack: (localParticipantMode === Constants.modes.SEND_AND_RECV && webcamOn) ? customVideoStream : null,
              customMicrophoneAudioTrack: (localParticipantMode === Constants.modes.SEND_AND_RECV && micOn) ? customAudioStream : null,
              mode: localParticipantMode,
            }}
            token={token}
            reinitialiseMeetingOnConfigChange={true}
            joinWithoutUserInteraction={true}
          >
            <MeetingStoreBridge />
            <MeetingContainer
              onMeetingLeave={() => {
                setToken("");
                setMeetingId("");
                setParticipantName("");
                setWebcamOn(false);
                setMicOn(false);
                setMeetingStarted(false);
              }}
              setIsMeetingLeft={setIsMeetingLeft}
              localParticipantMode={localParticipantMode}
            />
          </MeetingProvider>

        ) : isMeetingLeft ? (
          <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
        ) : (

          <JoiningScreen
            participantName={participantName}
            setParticipantName={setParticipantName}
            setMeetingId={setMeetingId}
            setToken={setToken}
            micOn={micOn}
            setMicOn={setMicOn}
            webcamOn={webcamOn}
            setWebcamOn={setWebcamOn}
            customAudioStream={customAudioStream}
            setCustomAudioStream={setCustomAudioStream}
            customVideoStream={customVideoStream}
            setCustomVideoStream={setCustomVideoStream}
            onClickStartMeeting={() => {
              setMeetingStarted(true);
            }}
            startMeeting={isMeetingStarted}
            setIsMeetingLeft={setIsMeetingLeft}
            localParticipantMode={localParticipantMode}
            setLocalParticipantMode={setLocalParticipantMode}
          />
        )}
      </MeetingAppProvider>
    </>
  );
}

export default App;
