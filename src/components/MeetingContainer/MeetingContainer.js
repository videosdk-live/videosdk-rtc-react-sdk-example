import React, { useState, useEffect, useRef } from "react";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { TopBar } from "../TopBar";
import { Box, useTheme } from "@material-ui/core";
import { SidebarConatiner } from "../SidebarContainer/SidebarContainer";
import { ParticipantsViewer } from "./ParticipantView";
import { PresenterView } from "./PresenterView";
import { useSnackbar } from "notistack";
import { nameTructed, trimSnackBarText } from "../../utils/helper";
import useResponsiveSize from "../../utils/useResponsiveSize";

export const sideBarModes = {
  PARTICIPANTS: "PARTICIPANTS",
  CHAT: "CHAT",
};
export function MeetingContainer({ onMeetingLeave, setIsMeetingLeft }) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef();
  const { enqueueSnackbar } = useSnackbar();

  const presentingSideBarWidth = useResponsiveSize({
    xl: 320,
    lg: 280,
    md: 260,
    sm: 240,
    xs: 200,
  });

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
  const [sideBarMode, setSideBarMode] = useState(null);

  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName } = data;

      const isLocal = senderId === localParticipantId;

      new Audio(
        `https://static.videosdk.live/prebuilt/notification.mp3`
      ).play();

      enqueueSnackbar(
        `${isLocal ? "You" : nameTructed(senderName, 15)} raised hand 🖐🏼`
      );
    },
  });

  usePubSub("CHAT", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName, message } = data;

      const isLocal = senderId === localParticipantId;

      if (!isLocal) {
        new Audio(
          `https://static.videosdk.live/prebuilt/notification.mp3`
        ).play();

        enqueueSnackbar(
          trimSnackBarText(`${nameTructed(senderName, 15)} says: ${message}`)
        );
      }
    },
  });

  return (
    <div
      ref={containerRef}
      className="h-screen w-full flex flex-col bg-gray-800"
    >
      <div
        className={` flex flex-row bg-gray-800 `}
        style={{
          height: containerHeight - topBarHeight,
        }}
      >
        <div
          style={{
            width: sideBarMode
              ? containerWidth - presentingSideBarWidth
              : "100%",
          }}
        >
          {isPresenting ? (
            <PresenterView height={containerHeight - topBarHeight} />
          ) : (
            <ParticipantsViewer height={containerHeight - topBarHeight} />
          )}
        </div>
        <div className="flex flex-row">
          <SidebarConatiner
            height={containerHeight - topBarHeight}
            setSideBarMode={setSideBarMode}
            sideBarMode={sideBarMode}
          />
        </div>
      </div>
      <TopBar
        topbarHeight={topBarHeight}
        sideBarMode={sideBarMode}
        setSideBarMode={setSideBarMode}
        setIsMeetingLeft={setIsMeetingLeft}
      />
    </div>
  );
}
