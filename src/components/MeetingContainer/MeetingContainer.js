import React, { useState,useEffect, useRef } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { TopBar } from "../TopBar";
import { Box, Grid, useTheme } from "@material-ui/core";
import { SidebarConatiner } from "../SidebarContainer/SidebarContainer";
import { ParticipantsViewer } from "./ParticipantView";
import { PresenterView } from "./PresenterView";

export function MeetingContainer({ onMeetingLeave }) {

  const [containerHeight, setContainerHeight] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef();

  useEffect(() => {
    containerRef.current?.offsetHeight &&
      setContainerHeight(containerRef.current.offsetHeight);
    containerRef.current?.offsetWidth &&
      setContainerWidth(containerRef.current.offsetWidth);

    window.addEventListener("resize", ({ target }) => {
      containerRef.current?.offsetHeight &&
        setContainerHeight(containerRef.current.offsetHeight);
      containerRef.current?.offsetWidth &&
        setContainerWidth(containerRef.current.offsetWidth);
    });
    console.log("height", containerHeight);
  }, []);

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
    onMeetingLeave();
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

  const theme = useTheme();
  const mMeeting = useMeeting({
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
  
  const isPresenting = mMeeting.presenterId ? true : false;

  const topBarHeight = 60;
  const [sideBarMode, setSideBarMode] = useState(null)
  return (
    <div
      ref = {containerRef}
      style={{
        height:"100vh",
        width: "100",
        flexDirection: "column",
        display: "flex",
        backgroundColor: theme.palette.background.default,
      }}>
      <TopBar topbarHeight={topBarHeight}
      sideBarMode = {sideBarMode}
      setSideBarMode={setSideBarMode} />
      <Box
        style={{
          height: containerHeight - topBarHeight,
          display: "flex",
          backgroundColor: theme.palette.background.default,
        }}>
          {isPresenting? <PresenterView
          height= {containerHeight - topBarHeight}
          /> : <ParticipantsViewer 
            height= {containerHeight - topBarHeight}/>}
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
          }}>
          <SidebarConatiner
            height= {containerHeight - topBarHeight}
            setSideBarMode = {setSideBarMode}
            sideBarMode={sideBarMode}
          />
        </Box>
      </Box>
    </div>
  );
}
