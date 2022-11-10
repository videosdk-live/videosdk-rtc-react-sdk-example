import React, { useState, useEffect, useRef } from "react";
import { Constants, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import { PresenterView } from "../components/PresenterView";
import { useSnackbar } from "notistack";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import useResponsiveSize from "../hooks/useResponsiveSize";
import useWindowSize from "../hooks/useWindowSize";
import { ILSBottomBar } from "./components/ILSBottomBar";
import { TopBar } from "./components/TopBar";
import useIsTab from "../hooks/useIsTab";
import PollsListner from "./components/pollContainer/PollListner";
import HLSContainer from "./components/hlsViewContainer/HLSContainer";
import FlyingEmojisOverlay from "./components/FlyingEmojisOverlay";
import { ILSParticipantView } from "./components/ILSParticipantView";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import { meetingModes } from "../utils/common";

export function ILSContainer({
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
  const bottomBarHeight = 60;
  const topBarHeight = 60;

  const [sideBarMode, setSideBarMode] = useState(null);
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
    // console.log(" onParticipantJoined", participant);
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

  const mMeeting = useMeeting({
    onParticipantJoined,
    onEntryResponded,
    onMeetingJoined,
    onMeetingLeft,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
    onHlsStateChanged: _handleOnHlsStateChanged,
  });

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const isPresenting = mMeeting.presenterId ? true : false;

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
            <PollsListner
              polls={polls}
              setDraftPolls={setDraftPolls}
              setCreatedPolls={setCreatedPolls}
              setEndedPolls={setEndedPolls}
              setSideBarMode={setSideBarMode}
            />

            {meetingMode === meetingModes.CONFERENCE && (
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
                      height={containerHeight - topBarHeight - bottomBarHeight}
                    />
                  ) : null}
                  {isPresenting && isMobile ? null : (
                    <ILSParticipantView
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
