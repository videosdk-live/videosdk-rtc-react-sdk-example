import React, { useState, useEffect, useRef, createRef } from "react";
import {
  Constants,
  createCameraVideoTrack,
  useMeeting,
  usePubSub,
} from "@videosdk.live/react-sdk";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import { PresenterView } from "../components/PresenterView";
import { useSnackbar } from "notistack";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import useResponsiveSize from "../hooks/useResponsiveSize";
import { ILSBottomBar } from "./components/ILSBottomBar";
import { TopBar } from "./components/TopBar";
import useIsTab from "../hooks/useIsTab";
import PollsListner from "./components/pollContainer/PollListner";
import HLSContainer from "./components/hlsViewContainer/HLSContainer";
import FlyingEmojisOverlay from "./components/FlyingEmojisOverlay";
import { ILSParticipantView } from "./components/ILSParticipantView";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import LocalParticipantListner from "./components/LocalParticipantListner";
import ConfirmBox from "../components/ConfirmBox";

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
  const [meetingError, setMeetingError] = useState(false);
  const mMeetingRef = useRef();
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] =
    useState(null);

  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();
  const meetingModeRef = useRef(meetingMode);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);

  const sideBarContainerWidth = useResponsiveSize({
    xl: 400,
    lg: 360,
    md: 320,
    sm: 280,
    xs: 240,
  });

  useEffect(() => {
    const boundingRect = containerRef.current.getBoundingClientRect();
    const { width, height } = boundingRect;

    if (height !== containerHeightRef.current) {
      setContainerHeight(height);
    }

    if (width !== containerWidthRef.current) {
      setContainerWidth(width);
    }
  }, [containerRef]);

  const { participantRaisedHand } = useRaisedHandParticipants();

  const _handleMeetingLeft = () => {
    setIsMeetingLeft(true);
  };

  const _handleOnRecordingStateChanged = ({ status }) => {
    if (
      meetingModeRef.current === Constants.modes.CONFERENCE &&
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
      meetingModeRef.current === Constants.modes.CONFERENCE && // trigger on conference mode only
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
        setTimeout(async () => {
          const track = await createCameraVideoTrack({
            optimizationMode: "motion",
            encoderConfig: "h1080p_w1920p",
            facingMode: "environment",
            cameraId: selectedWebcam.id,
            multiStream: false,
          });
          changeWebcam(track);
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

  const _handleOnError = (data) => {
    const { code, message } = data;

    const joiningErrCodes = [
      4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
    ];

    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");

    new Audio(
      isCriticalError
        ? `https://static.videosdk.live/prebuilt/notification_critical_err.mp3`
        : `https://static.videosdk.live/prebuilt/notification_err.mp3`
    ).play();

    setMeetingError({
      code,
      message: isJoiningError ? "Unable to join meeting!" : message,
    });
  };

  const mMeeting = useMeeting({
    onParticipantJoined,
    onEntryResponded,
    onMeetingJoined,
    onMeetingLeft,
    onError: _handleOnError,
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

  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;
  const isTab = useIsTab();

  return (
    <div
      // style={{ height: windowHeight }}
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

            {mMeeting?.localParticipant?.id && (
              <LocalParticipantListner
                localParticipantId={mMeeting?.localParticipant?.id}
                meetingMode={meetingMode}
              />
            )}
            {meetingMode === Constants.modes.CONFERENCE && (
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
              {meetingMode === Constants.modes.CONFERENCE ? (
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
                  meetingMode === Constants.modes.VIEWER
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
      <ConfirmBox
        open={meetingError}
        successText="OKAY"
        onSuccess={() => {
          setMeetingError(false);
        }}
        title={`Error Code: ${meetingError.code}`}
        subTitle={meetingError.message}
      />
    </div>
  );
}
