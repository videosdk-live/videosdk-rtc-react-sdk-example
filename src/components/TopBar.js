import {
  Box,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
  useTheme,
} from "@material-ui/core";
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
import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useState } from "react";
import useResponsiveSize from "../utils/useResponsiveSize";

const useStyles = makeStyles({
  row: { display: "flex", alignItems: "center" },
  borderRight: { borderRight: "1ps solid #ffffff33" },
  popover: { backgroundColor: "transparent" },
  popoverBorder: {
    borderRadius: "12px",
    backgroundColor: "#212032",
    marginTop: 8,
    width: 300,
  },
});

const OutlinedButton = ({ bgColor, onClick, icon, isFocused, tooltip }) => {
  const theme = useTheme();
  const [mouseOver, setMouseOver] = useState(false);

  return (
    <Tooltip
      placement="bottom"
      title={tooltip}>
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: theme.spacing(1),
        backgroundColor: bgColor
          ? bgColor
          : isFocused
          ? "#fff"
          : theme.palette.background.default,
        border: mouseOver
          ? "2px solid transparent"
          : bgColor
          ? "2px solid transparent"
          : "2px solid #ffffff33",
        transition: "all 200ms",
        transitionTimingFunction: "ease-in-out",
        margin: theme.spacing(1),
      }}
      onMouseEnter={() => {
        setMouseOver(true);
      }}
      onMouseLeave={() => {
        setMouseOver(false);
      }}>
      <IconButton
        variant="outlined"
        onClick={() => {
          onClick();
        }}
        style={{
          transition: "all 200ms",
          color: isFocused ? "#1C1F2E" : "#fff",
          transitionTimingFunction: "ease-in-out",
          transform: `scale(${mouseOver ? 1.1 : 1})`,
        }}>
        {icon}
      </IconButton>
    </Box>
    </Tooltip>
  );
};

export function TopBar({ topBarHeight , sideBarMode, setSideBarMode}) {
  const mMeeting = useMeeting();
  const theme = useTheme();
  const padding = useResponsiveSize({
    xl: 6,
    lg: 6,
    md: 6,
    sm: 4,
    xs: 1.5,
  });

  const actions = [
    {
      icon: <RadioButtonChecked />,
      type: "RECORDING",
      onClick: () => {
        mMeeting.isRecording
          ? mMeeting.stopRecording()
          : mMeeting.startRecording();
      },
      isFocused: mMeeting.isRecording,
      tooltip:"Toggle Recording"
    },

    {
      icon: mMeeting.localMicOn ? <Mic /> : <MicOff />,
      type: "MIC",
      onClick: () => {
        mMeeting.toggleMic();
      },
      isFocused: mMeeting.localMicOn,
      tooltip:"Toggle Mic"
    },
    {
      icon: mMeeting.localWebcamOn ? <Videocam /> : <VideocamOff />,
      type: "WEBCAM",
      onClick: () => {
        mMeeting.toggleWebcam();
      },
      isFocused: mMeeting.localWebcamOn,
      tooltip:"Toggle Webcam"
    },
    {
      icon: <ScreenShare />,
      type: "SCREENSHARE",
      onClick: () => {
        mMeeting?.toggleScreenShare();
      },
      isFocused: mMeeting.localScreenShareOn,
      tooltip:"Toggle ScreenShare"
    },
    {
      icon: <Person />,
      type: "PARTICIPANTS",
      onClick: () => {
        setSideBarMode("PARTICIPANTS")
      },
      isFocused:sideBarMode ==="PARTICIPANTS",
      tooltip:"View Participants"
    },
    {
      icon: <Message />,
      type: "CHAT",
      onClick: () => {
        //handle chat sidebar toggle
        setSideBarMode("CHAT")
      },
      isFocused:sideBarMode ==="CHAT" ,
      tooltip:"View Chat"
    },
    {
      icon: <CallEnd />,
      type: "END_CALL",
      bgColor: "#D32F2F",
      onClick: () => {
        mMeeting.leave();
      },
      tooltip:"Leave Meeting"
    },
  ];
  return (
    <Box
      style={{
        height: topBarHeight,
        display: "flex",
        flex: 1,
        justifyContent: "space-between",
        backgroundColor: theme.palette.background.default,
        borderBottom: "1px solid #ffffff33",
        position: "relative",
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      }}>
      <Box
        style={{
          display: "flex",
          alignItem: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        <Typography
          variant="h6"
          style={{alignSelf:"center" }}>
          {mMeeting.meetingId}
        </Typography>
        <OutlinedButton
          onClick={() => {
            navigator.clipboard.writeText(mMeeting.meetingId);
          }}
          icon={<FileCopy />}
          isFocused={false}
          tooltip={"Copy Meeting id"}
        />
      </Box>
      <Box style={{ display: "flex", flexDirection: "row" }}>
        {actions.map((action) => {
          return (
            <OutlinedButton
              onClick={action.onClick}
              bgColor={action.bgColor}
              icon={action.icon}
              isFocused={action.isFocused}
              tooltip={action.tooltip}
            />
          );
        })}
      </Box>
    </Box>
  );
}
