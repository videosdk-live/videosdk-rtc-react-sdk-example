import { MeetingProvider } from "@videosdk.live/react-sdk";
import { useEffect } from "react";
import { useState } from "react";
import { MeetingAppProvider } from "./MeetingAppContextDef";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { JoiningScreen } from "./components/screens/JoiningScreen";

function App() {
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [participantName, setParticipantName] = useState("");

  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  const [selectedMic, setSelectedMic] = useState({ id: null });
  const [selectedWebcam, setSelectedWebcam] = useState({ id: null });
  const [selectedSpeaker, setSelectedSpeaker] = useState({ id: null });

  const [selectMicDeviceId, setSelectMicDeviceId] = useState(selectedMic.id);
  const [selectWebcamDeviceId, setSelectWebcamDeviceId] = useState(
    selectedWebcam.id
  );
  const [selectSpeakerDeviceId, setSelectSpeakerDeviceId] = useState(
    selectedSpeaker.id
  );
  
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);

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
      {isMeetingStarted ? (
        <MeetingAppProvider
          selectedMic={selectedMic}
          selectedWebcam={selectedWebcam}
          initialMicOn={micOn}
          initialWebcamOn={webcamOn}
        >
          <MeetingProvider
            config={{
              meetingId,
              micEnabled: micOn,
              webcamEnabled: webcamOn,
              name: participantName ? participantName : "TestUser",

              multiStream: true,
            }}
            token={token}
            reinitialiseMeetingOnConfigChange={true}
            joinWithoutUserInteraction={true}
          >
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
              selectedMic={selectedMic}
              selectedWebcam={selectedWebcam}
              selectWebcamDeviceId={selectWebcamDeviceId}
              setSelectWebcamDeviceId={setSelectWebcamDeviceId}
              selectMicDeviceId={selectMicDeviceId}
              setSelectMicDeviceId={setSelectMicDeviceId}
              micEnabled={micOn}
              webcamEnabled={webcamOn}
              selectedSpeaker={selectedSpeaker}
            />
          </MeetingProvider>
        </MeetingAppProvider>
      ) : isMeetingLeft ? (
        <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
      ) : (
        <JoiningScreen
          participantName={participantName}
          setParticipantName={setParticipantName}
          setMeetingId={setMeetingId}
          setToken={setToken}

          setMicOn={setMicOn}
          setWebcamOn={setWebcamOn}
          setSpeakerOn={setSpeakerOn}

          micEnabled={micOn}
          webcamEnabled={webcamOn}
          speakerEnabled={speakerOn}

          setSelectedMic={setSelectedMic}
          setSelectedWebcam={setSelectedWebcam}
          setSelectedSpeaker={setSelectedSpeaker}
          selectedSpeaker={selectedSpeaker}
          
          onClickStartMeeting={() => {
            setMeetingStarted(true);
          }}
          startMeeting={isMeetingStarted}
          setIsMeetingLeft={setIsMeetingLeft}
        />
      )}
    </>
  );
}

export default App;
