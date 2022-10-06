import {
  Badge,
  Box,
  ButtonBase,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
  useTheme,
} from "@material-ui/core";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useState } from "react";
import useResponsiveSize from "../utils/useResponsiveSize";
import Lottie from "react-lottie";
import {
  Person,
  Message,
  VideocamOff,
  MicOff,
  Mic,
  Videocam,
  CallEnd,
  ScreenShare,
  RadioButtonChecked,
  FileCopy,
} from "@material-ui/icons";
import RaiseHandIcon from "../icons/RaiseHandIcon";

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
}) => {
  const theme = useTheme();
  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  const iconSize = useResponsiveSize({
    xl: 24 * (large ? 1.7 : 1),
    lg: 24 * (large ? 1.7 : 1),
    md: 32 * (large ? 1.7 : 1),
    sm: 28 * (large ? 1.7 : 1),
    xs: 24 * (large ? 1.7 : 1),
  });

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
            {Icon && (
              <Badge max={1000} color={"secondary"} badgeContent={badge}>
                {lottieOption ? (
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
                )}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export function TopBar({ topBarHeight, sideBarMode, setSideBarMode }) {
  const mMeeting = useMeeting();
  const theme = useTheme();
  const { publish } = usePubSub("RAISE_HAND");

  const RaiseHand = () => {
    publish("Raise Hand");
  };

  const actions = [
    {
      Icon: RadioButtonChecked,
      type: "RECORDING",
      large: false,
      onClick: () => {
        mMeeting.isRecording
          ? mMeeting.stopRecording()
          : mMeeting.startRecording();
      },
      isFocused: mMeeting.isRecording,
      tooltip: "Toggle Recording",
    },

    {
      Icon: mMeeting.localMicOn ? Mic : MicOff,
      type: "MIC",
      large: false,
      onClick: () => {
        mMeeting.toggleMic();
      },
      isFocused: mMeeting.localMicOn,
      tooltip: "Toggle Mic",
    },
    {
      Icon: mMeeting.localWebcamOn ? Videocam : VideocamOff,
      type: "WEBCAM",
      large: false,
      onClick: () => {
        mMeeting.toggleWebcam();
      },
      isFocused: mMeeting.localWebcamOn,
      tooltip: "Toggle Webcam",
    },
    {
      Icon: ScreenShare,
      large: false,
      type: "SCREENSHARE",
      onClick: () => {
        mMeeting?.toggleScreenShare();
      },
      isFocused: mMeeting.localScreenShareOn,
      tooltip: "Toggle ScreenShare",
    },
    {
      Icon: Person,
      type: "PARTICIPANTS",
      onClick: () => {
        setSideBarMode("PARTICIPANTS");
      },
      isFocused: sideBarMode === "PARTICIPANTS",
      tooltip: "View Participants",
    },
    {
      Icon: RaiseHandIcon,
      type: "RAISE_HAND",
      onClick: () => {
        RaiseHand();
      },
      tooltip: "Raise Hand",
    },
    {
      Icon: Message,
      type: "CHAT",
      large: false,
      onClick: () => {
        //handle chat sidebar toggle
        setSideBarMode("CHAT");
      },
      isFocused: sideBarMode === "CHAT",
      tooltip: "View Chat",
    },
    {
      Icon: CallEnd,
      large: false,
      type: "END_CALL",
      bgColor: "bg-red-150",
      onClick: () => {
        mMeeting.leave();
      },
      tooltip: "Leave Meeting",
    },
  ];
  return (
    <div
      className={`flex flex-1 items-center justify-center h-[${topBarHeight}px] bg-gray-800 relative px-2`}
      style={{ borderTop: "1px solid #ffffff33" }}
    >
      <h1 className="text-white">{mMeeting.meetingId}</h1>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {actions.map((action) => {
          return (
            <OutlinedButton
              onClick={action.onClick}
              bgColor={action.bgColor}
              Icon={action.Icon}
              isFocused={action.isFocused}
              tooltip={action.tooltip}
            />
          );
        })}
      </div>
    </div>
  );
}
