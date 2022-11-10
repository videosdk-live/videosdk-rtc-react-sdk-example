import React, { useEffect, useMemo, useRef, useState } from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { MeetingContainer } from "./components/MeetingContainer/MeetingContainer";
import { SnackbarProvider } from "notistack";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { useTheme } from "@material-ui/styles";
import { useMediaQuery } from "@material-ui/core";
import { JoiningScreen } from "./components/screens/JoiningScreen";
import { meetingModes, meetingTypes } from "./utils/common";

const App = () => {
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);
  const [selectedMic, setSelectedMic] = useState({ id: null });
  const [selectedWebcam, setSelectedWebcam] = useState({ id: null });
  const [selectWebcamDeviceId, setSelectWebcamDeviceId] = useState(
    selectedWebcam.id
  );
  const [meetingType, setMeetingType] = useState(meetingTypes.MEETING);
  const [meetingMode, setMeetingMode] = useState(meetingModes.CONFERENCE);
  const [selectMicDeviceId, setSelectMicDeviceId] = useState(selectedMic.id);
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  const [raisedHandsParticipants, setRaisedHandsParticipants] = useState([]);

  const [draftPolls, setDraftPolls] = useState([]);
  const [createdPolls, setCreatedPolls] = useState([]);
  const [endedPolls, setEndedPolls] = useState([]);

  const [downstreamUrl, setDownstreamUrl] = useState(null);
  const [afterMeetingJoinedHLSState, setAfterMeetingJoinedHLSState] =
    useState(null);

  const polls = useMemo(
    () =>
      createdPolls.map((poll) => ({
        ...poll,
        isActive:
          endedPolls.findIndex(({ pollId }) => pollId === poll.id) === -1,
      })),
    [createdPolls, endedPolls]
  );

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

  const theme = useTheme();
  const isXStoSM = useMediaQuery(theme.breakpoints.only("xs"));

  useEffect(() => {
    if (isXStoSM) {
      window.onbeforeunload = () => {
        return "Are you sure you want to exit?";
      };
    }
  }, [isXStoSM]);

  return (
    <>
      {isMeetingStarted ? (
        <SnackbarProvider
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          autoHideDuration={5000}
          maxSnack={3}
        >
          <MeetingProvider
            config={{
              meetingId,
              micEnabled: micOn,
              webcamEnabled: webcamOn,
              name: participantName ? participantName : "TestUser",
              mode: meetingMode,
            }}
            token={token}
            reinitialiseMeetingOnConfigChange={true}
            joinWithoutUserInteraction={true}
          >
            <MeetingContainer
              onMeetingLeave={() => {
                setToken("");
                setMeetingId("");
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
              useRaisedHandParticipants={useRaisedHandParticipants}
              raisedHandsParticipants={raisedHandsParticipants}
              micEnabled={micOn}
              webcamEnabled={webcamOn}
              meetingType={meetingType}
              meetingMode={meetingMode}
              setMeetingMode={setMeetingMode}
              polls={polls}
              draftPolls={draftPolls}
              setDraftPolls={setDraftPolls}
              setCreatedPolls={setCreatedPolls}
              setEndedPolls={setEndedPolls}
              downstreamUrl={downstreamUrl}
              setDownstreamUrl={setDownstreamUrl}
              afterMeetingJoinedHLSState={afterMeetingJoinedHLSState}
              setAfterMeetingJoinedHLSState={setAfterMeetingJoinedHLSState}
            />
          </MeetingProvider>
        </SnackbarProvider>
      ) : isMeetingLeft ? (
        <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
      ) : (
        <JoiningScreen
          participantName={participantName}
          setParticipantName={setParticipantName}
          setMeetingId={setMeetingId}
          setToken={setToken}
          setMicOn={setMicOn}
          micEnabled={micOn}
          webcamEnabled={webcamOn}
          setSelectedMic={setSelectedMic}
          setSelectedWebcam={setSelectedWebcam}
          setWebcamOn={setWebcamOn}
          onClickStartMeeting={() => {
            setMeetingStarted(true);
          }}
          startMeeting={isMeetingStarted}
          setIsMeetingLeft={setIsMeetingLeft}
          meetingType={meetingType}
          setMeetingType={setMeetingType}
          meetingMode={meetingMode}
          setMeetingMode={setMeetingMode}
        />
      )}
    </>
  );
};

export default App;
