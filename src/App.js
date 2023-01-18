import React, { useEffect, useMemo, useRef, useState } from "react";
import { Constants, MeetingProvider } from "@videosdk.live/react-sdk";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { JoiningScreen } from "./components/screens/JoiningScreen";
import { meetingTypes } from "./utils/common";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { ILSContainer } from "./interactive-live-streaming/ILSContainer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MeetingAppProvider } from "./MeetingAppContextDef";

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

  const [meetingMode, setMeetingMode] = useState(Constants.modes.CONFERENCE);
  const [selectMicDeviceId, setSelectMicDeviceId] = useState(selectedMic.id);
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
                meetingMode={meetingMode}
                setMeetingMode={setMeetingMode}
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
                      // mode: Constants.modes.CONFERENCE,
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
                    startMeeting={isMeetingStarted}
                    setIsMeetingLeft={setIsMeetingLeft}
                    meetingMode={meetingMode}
                    setMeetingMode={setMeetingMode}
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
