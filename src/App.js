import React, { useEffect, useMemo, useRef, useState } from "react";
import { Constants, MeetingProvider } from "@videosdk.live/react-sdk";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { JoiningScreen } from "./components/screens/JoiningScreen";
import { meetingTypes } from "./utils/common";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { ILSContainer } from "./interactive-live-streaming/ILSContainer";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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
  const [meetingMode, setMeetingMode] = useState(Constants.modes.CONFERENCE);
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
    <BrowserRouter>
      <Routes>
        <Route
          exact
          path="/react-rtc-demo"
          element={
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
          }
        />
        <Route
          exact
          path="/"
          element={
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
          }
        ></Route>
        <Route
          exact
          path="/?type"
          element={
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
          }
        ></Route>
        <Route
          path={`conference-meeting/:id`}
          element={
            <>
              {isMeetingStarted ? (
                <MeetingProvider
                  config={{
                    meetingId,
                    micEnabled: micOn,
                    webcamEnabled: webcamOn,
                    name: participantName ? participantName : "TestUser",
                    mode: meetingMode,
                    multiStream:
                      meetingType === meetingTypes.MEETING ? true : false,
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
          }
        />
        <Route
          path={`interactive-meeting/:mode/:id`}
          element={
            <>
              {isMeetingStarted ? (
                <MeetingProvider
                  config={{
                    meetingId,
                    micEnabled: micOn,
                    webcamEnabled: webcamOn,
                    name: participantName ? participantName : "TestUser",
                    mode: meetingMode,
                    multiStream: false,
                  }}
                  token={token}
                  reinitialiseMeetingOnConfigChange={true}
                  joinWithoutUserInteraction={true}
                >
                  <ILSContainer
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
                    setAfterMeetingJoinedHLSState={
                      setAfterMeetingJoinedHLSState
                    }
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
          }
        />
      </Routes>
    </BrowserRouter>
  );

  return (
    <>
      {isMeetingStarted ? (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: micOn,
            webcamEnabled: webcamOn,
            name: participantName ? participantName : "TestUser",
            mode: meetingMode,
            multiStream: meetingType === meetingTypes.MEETING ? true : false,
          }}
          token={token}
          reinitialiseMeetingOnConfigChange={true}
          joinWithoutUserInteraction={true}
        >
          {meetingType === meetingTypes.MEETING ? (
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
            />
          ) : (
            <ILSContainer
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
          )}
        </MeetingProvider>
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
