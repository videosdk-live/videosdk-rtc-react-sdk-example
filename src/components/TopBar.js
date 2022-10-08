import { Badge, Tooltip } from "@material-ui/core";
import { Constants, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useResponsiveSize from "../utils/useResponsiveSize";
import Lottie from "react-lottie";
import { sideBarModes } from "./MeetingContainer/MeetingContainer";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/outline";
import recordingBlink from "../animations/recording-blink.json";
import useIsRecording from "./MeetingContainer/useIsRecording";
import RecordingIcon from "../icons/Topbar/RecordingIcon";
import MicOnIcon from "../icons/Topbar/MicOnIcon";
import MicOffIcon from "../icons/Topbar/MicOffIcon";
import WebcamOnIcon from "../icons/Topbar/WebcamOnIcon";
import WebcamOffIcon from "../icons/Topbar/WebcamOffIcon";
import ScreenShareIcon from "../icons/Topbar/ScreenShareIcon";
import ChatIcon from "../icons/Topbar/ChatIcon";
import ParticipantsIcon from "../icons/Topbar/ParticipantsIcon";
import EndIcon from "../icons/Topbar/EndIcon";
import RaiseHandIcon from "../icons/Topbar/RaiseHandIcon";

const OutlinedButton = ({
  bgColor,
  onClick,
  Icon,
  isFocused,
  tooltip,
  badge,
  lottieOption,
  disabledOpacity,
  disabled,
  large,
  btnID,
  color,
  focusIconColor,
  isRequestProcessing,
}) => {
  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [blinkingState, setBlinkingState] = useState(1);

  const intervalRef = useRef();

  const iconSize = useResponsiveSize({
    xl: 24 * (large ? 1.7 : 1),
    lg: 24 * (large ? 1.7 : 1),
    md: 32 * (large ? 1.7 : 1),
    sm: 28 * (large ? 1.7 : 1),
    xs: 24 * (large ? 1.7 : 1),
  });

  const startBlinking = () => {
    intervalRef.current = setInterval(() => {
      setBlinkingState((s) => (s === 1 ? 0.4 : 1));
    }, 600);
  };

  const stopBlinking = () => {
    clearInterval(intervalRef.current);

    setBlinkingState(1);
  };

  useEffect(() => {
    if (isRequestProcessing) {
      startBlinking();
    } else {
      stopBlinking();
    }
  }, [isRequestProcessing]);

  useEffect(() => {
    return () => {
      stopBlinking();
    };
  }, []);

  return (
    <Tooltip placement="top" title={tooltip} open={mouseOver || mouseDown}>
      <div
        className={`flex items-center justify-center  rounded-lg ${
          bgColor ? `${bgColor}` : isFocused ? "bg-white" : "bg-gray-750"
        } ${
          mouseOver
            ? "border-2 border-transparent border-solid"
            : bgColor
            ? "border-2 border-transparent border-solid"
            : "border-2 border-solid border-[#ffffff33]"
        } m-2`}
        style={{
          transition: "all 200ms",
          transitionTimingFunction: "ease-in-out",
          opacity: blinkingState,
        }}
      >
        <div
          className="cursor-pointer"
          id={btnID}
          onMouseEnter={() => {
            setMouseOver(true);
          }}
          onMouseLeave={() => {
            setMouseOver(false);
          }}
          onMouseDown={() => {
            setMouseDown(true);
          }}
          onMouseUp={() => {
            setMouseDown(false);
          }}
          disabled={disabled}
          onClick={onClick}
        >
          <div
            className="flex items-center justify-center p-1 m-1 rounded-lg"
            style={{
              opacity: disabled ? disabledOpacity || 0.7 : 1,
              transform: `scale(${mouseOver ? (mouseDown ? 0.95 : 1.1) : 1})`,
              transition: `all ${200 * 1}ms`,
              transitionTimingFunction: "linear",
            }}
          >
            {Icon &&
              (lottieOption ? (
                <div className={`flex items-center justify-center`}>
                  <Lottie
                    style={{ height: iconSize }}
                    options={lottieOption}
                    eventListeners={[{ eventName: "done" }]}
                    height={iconSize}
                    width={
                      (iconSize * lottieOption?.width) / lottieOption?.height
                    }
                    isClickToPauseDisabled
                  />
                </div>
              ) : (
                <>
                  <Icon
                    style={{
                      color: isFocused
                        ? focusIconColor || "#1C1F2E"
                        : color
                        ? color
                        : "#fff",
                      height: iconSize,
                      width: iconSize,
                    }}
                    fillColor={
                      isFocused
                        ? focusIconColor || "#1C1F2E"
                        : color
                        ? color
                        : "#fff"
                    }
                  />
                  {badge && (
                    <p
                      className={`${
                        isFocused ? "text-black" : "text-white"
                      } text-base ml-2`}
                    >
                      {badge}
                    </p>
                  )}
                </>
              ))}
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export function TopBar({
  topBarHeight,
  sideBarMode,
  setSideBarMode,
  setIsMeetingLeft,
}) {
  const mMeeting = useMeeting();
  const { participants } = useMeeting();

  const { publish } = usePubSub("RAISE_HAND");
  const [isCopied, setIsCopied] = useState(false);

  console.log("participants", participants);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: recordingBlink,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
    height: 64,
    width: 160,
  };

  const startRecording = mMeeting?.startRecording;
  const stopRecording = mMeeting?.stopRecording;
  const recordingState = mMeeting?.recordingState;

  const isRecording = useIsRecording();

  const isRecordingRef = useRef(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const { isRequestProcessing } = useMemo(
    () => ({
      isRequestProcessing:
        recordingState === Constants.recordingEvents.RECORDING_STARTING ||
        recordingState === Constants.recordingEvents.RECORDING_STOPPING,
    }),
    [recordingState]
  );

  const _handleClick = () => {
    const isRecording = isRecordingRef.current;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const RaiseHand = () => {
    publish("Raise Hand");
  };

  const actions = [
    {
      Icon: RecordingIcon,
      onClick: () => {
        _handleClick();
      },
      isFocused: isRecording,
      tooltip:
        recordingState === Constants.recordingEvents.RECORDING_STARTED
          ? "Stop Recording"
          : recordingState === Constants.recordingEvents.RECORDING_STARTING
          ? "Starting Recording"
          : recordingState === Constants.recordingEvents.RECORDING_STOPPED
          ? "Start Recording"
          : recordingState === Constants.recordingEvents.RECORDING_STOPPING
          ? "Stopping Recording"
          : "Start Recording",
      lottieOption: isRecording ? defaultOptions : null,
      isRequestProcessing: isRequestProcessing,
    },

    {
      Icon: mMeeting.localMicOn ? MicOnIcon : MicOffIcon,
      bgColor: mMeeting.localMicOn ? "" : "bg-white",
      onClick: () => {
        mMeeting.toggleMic();
      },
      isFocused: mMeeting.localMicOn,
      tooltip: "Toggle Mic",
    },
    {
      Icon: mMeeting.localWebcamOn ? WebcamOnIcon : WebcamOffIcon,
      bgColor: mMeeting.localWebcamOn ? "" : "bg-white",
      onClick: () => {
        mMeeting.toggleWebcam();
      },
      isFocused: mMeeting.localWebcamOn,
      tooltip: "Toggle Webcam",
    },
    {
      Icon: ScreenShareIcon,
      onClick: () => {
        mMeeting?.toggleScreenShare();
      },
      isFocused: mMeeting.localScreenShareOn,
      tooltip: "Toggle ScreenShare",
    },

    {
      Icon: RaiseHandIcon,
      onClick: () => {
        RaiseHand();
      },
      tooltip: "Raise Hand",
    },

    {
      Icon: EndIcon,
      bgColor: "bg-red-150",
      onClick: () => {
        mMeeting.leave();
        setIsMeetingLeft(true);
      },
      tooltip: "Leave Meeting",
    },
  ];

  const iconsArr = [
    {
      Icon: ChatIcon,
      onClick: () => {
        setSideBarMode((s) =>
          s === sideBarModes.CHAT ? null : sideBarModes.CHAT
        );
      },
      isFocused: sideBarMode === "CHAT",
      tooltip: "View Chat",
    },
    {
      Icon: ParticipantsIcon,
      onClick: () => {
        setSideBarMode((s) =>
          s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
        );
      },
      isFocused: sideBarMode === "PARTICIPANTS",
      tooltip: "View Participants",
      badge: `${new Map(participants)?.size}`,
    },
  ];

  return (
    <div className="md:flex lg:px-6 pb-2 px-2 hidden">
      <div className="flex items-center justify-center ">
        <div className="flex border-2 border-gray-850 p-2 rounded-md items-center justify-center">
          <h1 className="text-white text-base ">{mMeeting.meetingId}</h1>
          <button
            className="ml-2"
            onClick={() => {
              navigator.clipboard.writeText(mMeeting.meetingId);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 text-green-400" />
            ) : (
              <ClipboardIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        <div className="flex border-2 border-gray-850 p-2 ml-4 rounded-md items-center justify-center">
          <h1 className="text-white">00:30</h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {actions.map((action) => {
          return (
            <OutlinedButton
              key={`action-${action.tooltip}`}
              onClick={action.onClick}
              bgColor={action.bgColor}
              Icon={action.Icon}
              isFocused={action.isFocused}
              tooltip={action.tooltip}
              lottieOption={action.lottieOption}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-center">
        {iconsArr.map((action) => {
          return (
            <OutlinedButton
              key={`action-${action.tooltip}`}
              onClick={action.onClick}
              bgColor={action.bgColor}
              Icon={action.Icon}
              isFocused={action.isFocused}
              tooltip={action.tooltip}
              badge={action.badge}
            />
          );
        })}
      </div>
    </div>
  );
}
