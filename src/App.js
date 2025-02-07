import React, { useEffect, useMemo, useRef, useState } from "react";
import { Constants, MeetingProvider } from "@videosdk.live/react-sdk";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { JoiningScreen } from "./components/screens/JoiningScreen";
import { meetingTypes } from "./utils/common";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { HLSContainerView } from "./http-live-streaming/HLSContainerView";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MeetingAppProvider } from "./MeetingAppContextDef";
import { createStream, VIDEOSDK_TOKEN } from "./api";
import { ILSContainerView } from "./interactive-live-streaming/ILSContainerView";

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

  const [meetingMode, setMeetingMode] = useState(Constants.modes.SEND_AND_RECV);
  const [selectMicDeviceId, setSelectMicDeviceId] = useState(selectedMic.id);
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isStreamStarted, setStreamStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  const [isStreamLeft, setIsStreamLeft] = useState(false);
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

  // ILS
  const [streamId, setStreamId] = useState("");
  const [mode, setMode] = useState(Constants.modes.SEND_AND_RECV);

  // const initializeStream = async (id)=> {
  //   const newStreamId = id || (await createStream({token: VIDEOSDK_TOKEN}))
  //   setStreamId(newStreamId)
  //   return newStreamId;
  // }

  // useEffect(()=> {
  //   initializeStream()
  // },[])


  const onStreamLeave = () => setStreamId(null);

  // Add this effect to help debug state changes

  return (
    <MeetingAppProvider>
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
                setMode={setMode}
                setMicOn={setMicOn}
                micEnabled={micOn}
                webcamEnabled={webcamOn}
                setSelectedMic={setSelectedMic}
                setSelectedWebcam={setSelectedWebcam}
                setWebcamOn={setWebcamOn}
                onClickStartMeeting={() => {
                  setMeetingStarted(true);
                }}
                onClickStartStream={() => {
                  setStreamStarted(true);
                }}
                startMeeting={isMeetingStarted}
                startStream={isStreamStarted}
                setIsMeetingLeft={setIsMeetingLeft}
                setIsStreamLeft={setIsStreamLeft}
                meetingMode={meetingMode}
                setMeetingMode={setMeetingMode}
                setStreamId={setStreamId}
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
                onClickStartStream={() => {
                  setStreamStarted(true);
                }}
                startMeeting={isMeetingStarted}
                startStream={isStreamStarted}
                setIsMeetingLeft={setIsMeetingLeft}
                setIsStreamLeft={setIsStreamLeft}
                meetingMode={meetingMode}
                setMeetingMode={setMeetingMode}
                setStreamId={setStreamId}
              />
            }
          ></Route>
          <Route
            exact
            path="/:type"
            element={
              <JoiningScreen
                participantName={participantName}
                setParticipantName={setParticipantName}
                setMeetingId={setMeetingId}
                setMode={setMode}
                setStreamId={setStreamId}
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
                onClickStartStream={() => {
                  setStreamStarted(true);
                }}
                startMeeting={isMeetingStarted}
                startStream={isStreamStarted}
                setIsMeetingLeft={setIsMeetingLeft}
                setIsStreamLeft={setIsStreamLeft}
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
                      mode: Constants.modes.CONFERENCE,
                      // mode: meetingMode,
                      multiStream: true, // meetingType === meetingTypes.MEETING ? true : false,
                    }}
                    token={token}
                    reinitialiseMeetingOnConfigChange={true}
                    joinWithoutUserInteraction={true}
                  >
                    <MeetingContainer
                      onMeetingLeave={() => {
                        // setToken("");
                        // setMeetingId("");
                        setWebcamOn(false);
                        setMicOn(false);
                        setMeetingStarted(false);
                        setIsMeetingLeft(true);
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
                    onClickStartStream={() => {
                      setStreamStarted(true);
                    }}
                    startMeeting={isMeetingStarted}
                    setIsMeetingLeft={setIsMeetingLeft}
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
                    <HLSContainerView
                      onMeetingLeave={() => {
                        // setToken("");
                        // setMeetingId("");
                        setWebcamOn(false);
                        setMicOn(false);
                        setMeetingStarted(false);
                        setIsMeetingLeft(true);
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
                      meetingMode={meetingMode}
                      setMeetingMode={setMeetingMode}
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
                    onClickStartStream={() => {
                      setStreamStarted(true);
                    }}
                    startMeeting={isMeetingStarted}
                    setIsMeetingLeft={setIsMeetingLeft}
                    meetingMode={meetingMode}
                    setMeetingMode={setMeetingMode}
                  />
                )}
              </>
            }
          />
          <Route
            path={`interactive-live-streaming/:mode/:id`}
            element={
              <>
                
                {isStreamStarted ? (
                  <MeetingProvider
                    config={{
                      meetingId: streamId,
                      micEnabled: micOn,
                      webcamEnabled: webcamOn,
                      name: participantName ? participantName : "TestUser",
                      mode: mode,
                      multiStream: false, 
                    }}
                    token={token}
                    joinWithoutUserInteraction={true}
                  >
                    <ILSContainerView
                      onMeetingLeave={() => {
                        setWebcamOn(false);
                        setMicOn(false);
                        setStreamStarted(false);
                        setIsMeetingLeft(true);
                        setIsStreamLeft(true);
                      }}
                      setIsMeetingLeft={setIsMeetingLeft}
                      setIsStreamLeft={setIsStreamLeft}
                      selectedMic={selectedMic}
                      selectedWebcam={selectedWebcam}
                      selectWebcamDeviceId={selectWebcamDeviceId}
                      setSelectWebcamDeviceId={setSelectWebcamDeviceId}
                      selectMicDeviceId={selectMicDeviceId}
                      setSelectMicDeviceId={setSelectMicDeviceId}
                      micEnabled={micOn}
                      webcamEnabled={webcamOn}
                      meetingMode={meetingMode}
                      setMeetingMode={setMeetingMode}
                      mode={mode}
                    /> 
                  </MeetingProvider>
                ) : isStreamLeft ? (
                  <LeaveScreen
                    setIsMeetingLeft={setIsMeetingLeft}
                    setIsStreamLeft={setIsStreamLeft}
                  />
                ) : (
                  <JoiningScreen
                    participantName={participantName}
                    setParticipantName={setParticipantName}
                    setMode={setMode}
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
                    onClickStartStream={() => {
                      setStreamStarted(true);
                    }}
                    startMeeting={isMeetingStarted}
                    setIsMeetingLeft={setIsMeetingLeft}
                    setIsStreamLeft={setIsStreamLeft}
                    meetingMode={meetingMode}
                    setMeetingMode={setMeetingMode}
                    setStreamId={setStreamId}
                  />
                )}
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </MeetingAppProvider>
  );
};

export default App;
