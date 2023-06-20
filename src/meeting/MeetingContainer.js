import React, { useState, useEffect, useRef, createRef } from "react";
import { Constants, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { BottomBar } from "./components/BottomBar";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import MemorizedParticipantView from "./components/ParticipantView";
import { PresenterView } from "../components/PresenterView";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import ConfirmBox from "../components/ConfirmBox";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";
import { useMediaQuery } from "react-responsive";
import { toast } from "react-toastify";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import useMediaStream from "../hooks/useMediaStream";

export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
  selectedMic,
  selectedWebcam,
  selectWebcamDeviceId,
  setSelectWebcamDeviceId,
  selectMicDeviceId,
  setSelectMicDeviceId,
  micEnabled,
  webcamEnabled,
}) {
  const { useRaisedHandParticipants } = useMeetingAppContext();
  const { getVideoTrack } = useMediaStream();

  const bottomBarHeight = 60;

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] =
    useState(null);
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState(false);

  const mMeetingRef = useRef();
  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);

  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const sideBarContainerWidth = isXLDesktop
    ? 400
    : isLGDesktop
    ? 360
    : isTab
    ? 320
    : isMobile
    ? 280
    : 240;

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
  }, [containerRef]);

  const { participantRaisedHand } = useRaisedHandParticipants();

  const _handleMeetingLeft = () => {
    setIsMeetingLeft(true);
  };

  const _handleOnRecordingStateChanged = ({ status }) => {
    if (
      status === Constants.recordingEvents.RECORDING_STARTED ||
      status === Constants.recordingEvents.RECORDING_STOPPED
    ) {
      toast(
        `${
          status === Constants.recordingEvents.RECORDING_STARTED
            ? "Meeting recording is started"
            : "Meeting recording is stopped."
        }`,
        {
          position: "bottom-left",
          autoClose: 4000,
          hideProgressBar: true,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  function onParticipantJoined(participant) {
    // Change quality to low, med or high based on resolution
    participant && participant.setQuality("high");
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
        let track;
        disableWebcam();
        setTimeout(async () => {
          track = await getVideoTrack({
            webcamId: selectedWebcam.id,
            encoderConfig: "h540p_w960p",
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

    setMeetingErrorVisible(true);
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
  });

  const isPresenting = mMeeting.presenterId ? true : false;

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName } = data;

      const isLocal = senderId === localParticipantId;

      new Audio(
        `https://static.videosdk.live/prebuilt/notification.mp3`
      ).play();

      toast(`${isLocal ? "You" : nameTructed(senderName, 15)} raised hand 🖐🏼`, {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

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

        toast(
          `${trimSnackBarText(
            `${nameTructed(senderName, 15)} says: ${message}`
          )}`,
          {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeButton: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
      }
    },
  });

  return (
    <div className="fixed inset-0">
      <div ref={containerRef} className="h-full flex flex-col bg-gray-800">
        {typeof localParticipantAllowedJoin === "boolean" ? (
          localParticipantAllowedJoin ? (
            <>
              <div className={` flex flex-1 flex-row bg-gray-800 `}>
                <div className={`flex flex-1 `}>
                  {isPresenting ? (
                    <PresenterView height={containerHeight - bottomBarHeight} />
                  ) : null}
                  {isPresenting && isMobile ? null : (
                    <MemorizedParticipantView isPresenting={isPresenting} />
                  )}
                </div>

                <SidebarConatiner
                  height={containerHeight - bottomBarHeight}
                  sideBarContainerWidth={sideBarContainerWidth}
                />
              </div>

              <BottomBar
                bottomBarHeight={bottomBarHeight}
                setIsMeetingLeft={setIsMeetingLeft}
                selectWebcamDeviceId={selectWebcamDeviceId}
                setSelectWebcamDeviceId={setSelectWebcamDeviceId}
                selectMicDeviceId={selectMicDeviceId}
                setSelectMicDeviceId={setSelectMicDeviceId}
              />
            </>
          ) : (
            <></>
          )
        ) : (
          !mMeeting.isMeetingJoined && <WaitingToJoinScreen />
        )}
        <ConfirmBox
          open={meetingErrorVisible}
          successText="OKAY"
          onSuccess={() => {
            setMeetingErrorVisible(false);
          }}
          title={`Error Code: ${meetingError.code}`}
          subTitle={meetingError.message}
        />
      </div>
    </div>
  );
}
