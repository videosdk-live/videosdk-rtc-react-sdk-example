import { Box, IconButton, makeStyles, useTheme } from "@material-ui/core";
import { Person, Message,VideocamOff, MicOff, Mic, Videocam, CallEnd } from "@material-ui/icons";
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

const OutlinedButton = ({ bgColor, onClick, icon }) => {
  const theme = useTheme();
  const [mouseOver, setMouseOver] = useState(false);
  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: theme.spacing(1),
        backgroundColor: bgColor ? bgColor : theme.palette.background.default,
        border: mouseOver ? "2px solid transparent" : bgColor ? "2px solid ": "2px solid #ffffff33",
        transition: "all 200ms",
        transitionTimingFunction: "ease-in-out",
        margin:theme.spacing(1)
      }}
      
      onMouseEnter={()=>{setMouseOver(true)}}
      onMouseLeave={()=>{setMouseOver(false)}}>
      <IconButton variant="outlined" onClick={onClick}>
        {icon}
      </IconButton>
    </Box>
  );
};

export function TopBar({ topBarHeight }) {
  const mMeeting = useMeeting();
  const theme = useTheme();
  const styles = useStyles(theme);
  const padding = useResponsiveSize({
    xl: 6,
    lg: 6,
    md: 6,
    sm: 4,
    xs: 1.5,
  });

  const actions = [
    { icon: mMeeting.localMicOn ? <Mic /> : <MicOff/>, type: "MIC", onClick: () => {} },
    { icon: mMeeting.localWebcamOn ? <Videocam /> : <VideocamOff/>, type: "WEBCAM", onClick: () => {} },
    { icon: <Person />, type: "PARTICIPANTS", onClick: () => {} },
    { icon: <Message />, type: "END_CALL", onClick: () => {} },
    { icon: <CallEnd />, type: "END_CALL",bgColor:"#D32F2F",  onClick: () => {} },
    
  ];
  return (
    <Box
      style={{
        height: topBarHeight,
        width: "100vh",
        display: "flex",
        alignItems: "center",
        //justifyContent: "space-between",
        backgroundColor: theme.palette.background.default,
        borderBottom: "1px solid #ffffff33",
        position: "relative"
      }}>
      {actions.map((action) => {
        return (
          <OutlinedButton
            onClick={action.onClick}
            bgColor={action.bgColor}
            icon={action.icon}
          />
        );
      })}
    </Box>
  );
}
