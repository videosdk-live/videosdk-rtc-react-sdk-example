import { MeetingProvider, createMicrophoneAudioTrack } from "@videosdk.live/react-sdk";
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
  const [selectedMic, setSelectedMic] = useState({ id: null });
  const [selectedWebcam, setSelectedWebcam] = useState({ id: null });
  const [selectedSpeaker, setSelectedSpeaker] = useState({ id: null });

  // const [selectMicDeviceId, setSelectMicDeviceId] = useState(selectedMic.id);
  // const [selectWebcamDeviceId, setSelectWebcamDeviceId] = useState(
  //   selectedWebcam.id
  // );

  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  let [customAudioTrack, setCustomTrack] = useState();


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
              customMicrophoneAudioTrack: customAudioTrack
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
              micOn={micOn}
              webcamOn={webcamOn}
              selectedMic={selectedMic}
              selectedWebcam={selectedWebcam}
              selectedSpeaker={selectedSpeaker}
              setSelectedMic={setSelectedMic}
              setSelectedWebcam={setSelectedWebcam}
              setSelectedSpeaker={setSelectedSpeaker}

            // selectWebcamDeviceId={selectWebcamDeviceId}
            // setSelectWebcamDeviceId={setSelectWebcamDeviceId}
            // selectMicDeviceId={selectMicDeviceId}
            // setSelectMicDeviceId={setSelectMicDeviceId}
            //micEnabled={micOn}
            //webcamEnabled={webcamOn}

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
          micOn={micOn}
          setMicOn={setMicOn}
          webcamOn={webcamOn}
          setWebcamOn={setWebcamOn}
          selectedMic={selectedMic}
          setSelectedMic={setSelectedMic}
          selectedWebcam={selectedWebcam}
          setSelectedWebcam={setSelectedWebcam}
          selectedSpeaker={selectedSpeaker}
          setSelectedSpeaker={setSelectedSpeaker}
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
