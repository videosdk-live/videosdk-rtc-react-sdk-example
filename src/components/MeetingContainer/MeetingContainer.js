import React, { useState, useEffect, useRef } from "react";
import { Constants, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { BottomBar } from "../../meeting/pages/BottomBar";
import { SidebarConatiner } from "../SidebarContainer/SidebarContainer";
import { ParticipantsViewer } from "../../meeting/pages/ParticipantView";
import { PresenterView } from "./PresenterView";
import { useSnackbar } from "notistack";
import { nameTructed, trimSnackBarText } from "../../utils/helper";
import useResponsiveSize from "../../hooks/useResponsiveSize";
import useWindowSize from "../../hooks/useWindowSize";
import { ILSBottomBar } from "../../interactive-live-streaming/pages/ILSBottomBar";
import { TopBar } from "../../interactive-live-streaming/pages/TopBar";
import useIsTab from "../../hooks/useIsTab";
import PollsListner from "../../interactive-live-streaming/pages/pollContainer/PollListner";
import HLSContainer from "../../interactive-live-streaming/pages/hlsViewContainer/HLSContainer";
import ModeListner from "../../interactive-live-streaming/pages/ModeListner";
import FlyingEmojisOverlay from "../../interactive-live-streaming/pages/FlyingEmojisOverlay";
import { ILSParticipantView } from "../../interactive-live-streaming/pages/ILSParticipantView";
import WaitingToJoinScreen from "../screens/WaitingToJoinScreen";
import { meetingModes, meetingTypes } from "../../utils/common";

export const sideBarModes = {
  PARTICIPANTS: "PARTICIPANTS",
  CHAT: "CHAT",
  LAYOUT: "LAYOUT",
  POLLS: "POLLS",
  CREATE_POLL: "CREATE_POLL",
};
export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
  selectedMic,
  selectedWebcam,
  selectWebcamDeviceId,
  setSelectWebcamDeviceId,
  selectMicDeviceId,
  setSelectMicDeviceId,
  useRaisedHandParticipants,
  raisedHandsParticipants,
  micEnabled,
  webcamEnabled,
  meetingType,
  meetingMode,
  setMeetingMode,
  polls,
  draftPolls,
  setDraftPolls,
  setCreatedPolls,
  setEndedPolls,
  downstreamUrl,
  setDownstreamUrl,
  afterMeetingJoinedHLSState,
  setAfterMeetingJoinedHLSState,
}) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const mMeetingRef = useRef();
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] =
    useState(null);
  const containerRef = useRef();
  const meetingModeRef = useRef(meetingMode);
  const { enqueueSnackbar } = useSnackbar();

  const sideBarContainerWidth = useResponsiveSize({
    xl: 400,
    lg: 360,
    md: 320,
    sm: 280,
    xs: 240,
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
  }, []);

  const { participantRaisedHand } = useRaisedHandParticipants();

  const _handleMeetingLeft = () => {
    setIsMeetingLeft(true);
  };

  const _handleOnRecordingStateChanged = ({ status }) => {
    if (
      meetingModeRef.current === meetingModes.CONFERENCE &&
      (status === Constants.recordingEvents.RECORDING_STARTED ||
        status === Constants.recordingEvents.RECORDING_STOPPED)
    ) {
      enqueueSnackbar(
        status === Constants.recordingEvents.RECORDING_STARTED
          ? "Meeting recording is started."
          : "Meeting recording is stopped."
      );
    }
  };

  const _handleOnHlsStateChanged = (data) => {
    //
    if (
      meetingModeRef.current === meetingModes.CONFERENCE && // trigger on conference mode only
      (data.status === Constants.hlsEvents.HLS_STARTED ||
        data.status === Constants.hlsEvents.HLS_STOPPED)
    ) {
      enqueueSnackbar(
        data.status === Constants.hlsEvents.HLS_STARTED
          ? "Meeting HLS is started."
          : "Meeting HLS is stopped."
      );
    }

    if (
      data.status === Constants.hlsEvents.HLS_STARTED ||
      data.status === Constants.hlsEvents.HLS_STOPPED
    ) {
      setDownstreamUrl(
        data.status === Constants.hlsEvents.HLS_STARTED
          ? data.downstreamUrl
          : null
      );
    }

    if (data.status === Constants.hlsEvents.HLS_STARTED) {
      setAfterMeetingJoinedHLSState("STARTED");
    }

    if (data.status === Constants.hlsEvents.HLS_STOPPED) {
      setAfterMeetingJoinedHLSState("STOPPED");
    }

    //set downstream url on basis of started or stopped
  };

  function onParticipantJoined(participant) {
    // Change quality to low, med or high based on resolution
    participant && participant.setQuality("high");
    console.log(" onParticipantJoined", participant);
  }
  function onParticipantLeft(participant) {
    // console.log(" onParticipantLeft", participant);
  }
  const onSpeakerChanged = (activeSpeakerId) => {
    // console.log(" onSpeakerChanged", activeSpeakerId);
  };
  function onPresenterChanged(presenterId) {
    // console.log(" onPresenterChanged", presenterId);
  }
  function onMainParticipantChanged(participant) {
    // console.log(" onMainParticipantChanged", participant);
  }
  function onEntryRequested(participantId, name) {
    // console.log(" onEntryRequested", participantId, name);
  }
  function onEntryResponded(participantId, name) {
    // console.log(" onEntryResponded", participantId, name);
    if (mMeetingRef.current?.localParticipant?.id === participantId) {
      if (name === "allowed") {
        setLocalParticipantAllowedJoin(true);
      } else {
        setLocalParticipantAllowedJoin(false);
        setTimeout(() => {
          _handleMeetingLeft();
        }, 3000);
      }
    }
  }
  function onRecordingStarted() {
    // console.log(" onRecordingStarted");
  }
  function onRecordingStopped() {
    // console.log(" onRecordingStopped");
  }
  function onChatMessage(data) {
    // console.log(" onChatMessage", data);
  }
  async function onMeetingJoined() {
    // console.log("onMeetingJoined");
    const { changeWebcam, changeMic, muteMic, disableWebcam } =
      mMeetingRef.current;

    if (webcamEnabled && selectedWebcam.id) {
      await new Promise((resolve) => {
        disableWebcam();
        setTimeout(() => {
          changeWebcam(selectedWebcam.id);
          resolve();
        }, 500);
      });
    }

    if (micEnabled && selectedMic.id) {
      await new Promise((resolve) => {
        muteMic();
        setTimeout(() => {
          changeMic(selectedMic.id);
          resolve();
        }, 500);
      });
    }
  }
  function onMeetingLeft() {
    // console.log("onMeetingLeft");
    onMeetingLeave();
  }
  const onLiveStreamStarted = (data) => {
    // console.log("onLiveStreamStarted example", data);
  };
  const onLiveStreamStopped = (data) => {
    // console.log("onLiveStreamStopped example", data);
  };

  const _handleOnHlsStarted = (data) => {};

  const _handleOnHlsStopped = () => {};

  const onVideoStateChanged = (data) => {
    // console.log("onVideoStateChanged", data);
  };
  const onVideoSeeked = (data) => {
    // console.log("onVideoSeeked", data);
  };

  const onWebcamRequested = (data) => {
    // console.log("onWebcamRequested", data);
  };
  const onMicRequested = (data) => {
    // console.log("onMicRequested", data);
  };
  const onPinStateChanged = (data) => {
    // console.log("onPinStateChanged", data);
  };

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
    onRecordingStateChanged: _handleOnRecordingStateChanged,
    onHlsStateChanged: _handleOnHlsStateChanged,
    onHlsStarted: _handleOnHlsStarted,
    onHlsStopped: _handleOnHlsStopped,
  });

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const isPresenting = mMeeting.presenterId ? true : false;

  const bottomBarHeight = 60;
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

      participantRaisedHand(senderId);
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

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;
  const isTab = useIsTab();

  return (
    <div
      style={{ height: windowHeight }}
      ref={containerRef}
      className="h-screen flex flex-col bg-gray-800"
    >
      <FlyingEmojisOverlay />
      {typeof localParticipantAllowedJoin === "boolean" ? (
        localParticipantAllowedJoin ? (
          <>
            <ModeListner
              meetingMode={meetingMode}
              setMeetingMode={setMeetingMode}
              setSideBarMode={setSideBarMode}
            />
            <PollsListner
              polls={polls}
              setDraftPolls={setDraftPolls}
              setCreatedPolls={setCreatedPolls}
              setEndedPolls={setEndedPolls}
              setSideBarMode={setSideBarMode}
            />

            {meetingType === meetingTypes.ILS &&
              meetingMode === meetingModes.CONFERENCE && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: isTab || isMobile ? "" : "column",
                    height: topBarHeight,
                  }}
                >
                  <TopBar topBarHeight={topBarHeight} />
                </div>
              )}
            <div className={` flex flex-1 flex-row bg-gray-800 `}>
              {meetingMode === meetingModes.CONFERENCE ? (
                <div className={`flex flex-1 `}>
                  {isPresenting ? (
                    <PresenterView
                      height={
                        meetingType === meetingTypes.MEETING
                          ? containerHeight - bottomBarHeight
                          : containerHeight - topBarHeight - bottomBarHeight
                      }
                    />
                  ) : null}
                  {isPresenting && isMobile ? null : meetingType ===
                    meetingTypes.ILS ? (
                    <ILSParticipantView
                      isPresenting={isPresenting}
                      sideBarMode={sideBarMode}
                    />
                  ) : (
                    <ParticipantsViewer
                      isPresenting={isPresenting}
                      sideBarMode={sideBarMode}
                    />
                  )}
                </div>
              ) : (
                <HLSContainer
                  {...{
                    downstreamUrl,
                    afterMeetingJoinedHLSState,
                    width:
                      containerWidth -
                      (isTab || isMobile
                        ? 0
                        : typeof sideBarMode === "string"
                        ? sideBarContainerWidth
                        : 0),
                  }}
                />
              )}
              <SidebarConatiner
                height={
                  meetingType === meetingTypes.MEETING ||
                  meetingMode === meetingModes.VIEWER
                    ? containerHeight - bottomBarHeight
                    : containerHeight - topBarHeight - bottomBarHeight
                }
                sideBarContainerWidth={sideBarContainerWidth}
                setSideBarMode={setSideBarMode}
                sideBarMode={sideBarMode}
                raisedHandsParticipants={raisedHandsParticipants}
                meetingMode={meetingMode}
                polls={polls}
                draftPolls={draftPolls}
              />
            </div>

            {meetingType === meetingTypes.MEETING ? (
              <BottomBar
                bottomBarHeight={bottomBarHeight}
                sideBarMode={sideBarMode}
                setSideBarMode={setSideBarMode}
                setIsMeetingLeft={setIsMeetingLeft}
                selectWebcamDeviceId={selectWebcamDeviceId}
                setSelectWebcamDeviceId={setSelectWebcamDeviceId}
                selectMicDeviceId={selectMicDeviceId}
                setSelectMicDeviceId={setSelectMicDeviceId}
              />
            ) : (
              <ILSBottomBar
                bottomBarHeight={bottomBarHeight}
                sideBarMode={sideBarMode}
                setSideBarMode={setSideBarMode}
                setIsMeetingLeft={setIsMeetingLeft}
                selectWebcamDeviceId={selectWebcamDeviceId}
                setSelectWebcamDeviceId={setSelectWebcamDeviceId}
                selectMicDeviceId={selectMicDeviceId}
                setSelectMicDeviceId={setSelectMicDeviceId}
                meetingMode={meetingMode}
              />
            )}
          </>
        ) : (
          <></>
        )
      ) : (
        !mMeeting.isMeetingJoined && <WaitingToJoinScreen />
      )}
    </div>
  );
}
