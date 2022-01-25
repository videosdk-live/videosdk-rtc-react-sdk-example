import React, { useEffect, useRef } from "react";
import { Box, Grid, Icon, Typography, useTheme } from "@material-ui/core";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import { nameTructed } from "../../utils/helper";
import useResponsiveSize from "../../utils/useResponsiveSize";
import { MicOff } from "@material-ui/icons";

function ParticipantView({ participantId }) {
  const webcamRef = useRef(null);
  const micRef = useRef(null);
  const theme = useTheme();

  const dpSize = useResponsiveSize({
    xl: 92,
    lg: 52,
    md: 52,
    sm: 52,
    xs: 52,
  });

  const {
    displayName,
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    isActiveSpeaker,
  } = useParticipant(participantId);
  const mMeeting = useMeeting();
  const isPresenting = mMeeting.isPresenting;

  useEffect(() => {
    if (webcamRef.current) {
      if (webcamOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);

        webcamRef.current.srcObject = mediaStream;
        webcamRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        webcamRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        position: "relative",
        overflow: "hidden",
        borderRadius: theme.spacing(1),
      }}>
      <div
        style={{
          position: "absolute",
          bottom: theme.spacing(1),
          left: theme.spacing(1),
          backgroundColor: "#00000066",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 200ms",
          transitionTimingFunction: "linear",
          padding: theme.spacing(1),
        }}>
        {!micOn ? <MicOff fontSize="small" color="primary"></MicOff> : <></>}

        <Typography variant="subtitle2">
          {isPresenting
            ? isLocal
              ? `You are presenting`
              : `${nameTructed(displayName, 15)} is presenting`
            : isLocal
            ? "You"
            : nameTructed(displayName, 26)}
        </Typography>
      </div>
      <audio ref={micRef} autoPlay />
      {webcamOn ? (
        <video height="100%" width={"100%"} ref={webcamRef} autoPlay  style={{objectFit:"cover", objectPosition:"center center"}}/>
      ) : (
        <div
          style={{
            height: "100%",
            width:"100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <Box
            style={{
              zIndex: 10,
              height: dpSize,
              width: dpSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 100,
              backgroundColor: theme.palette.background.default,
              transition: "height 800ms, width 800ms",
              transitionTimingFunction: "ease-in-out",
            }}>
            <Typography variant="h5">
              {String(displayName).charAt(0).toUpperCase()}
            </Typography>
          </Box>
        </div>
      )}
    </div>
  );
}

export function ParticipantsViewer({height}){

  const theme = useTheme();
  const mMeeting = useMeeting();
  const participants = mMeeting?.participants;

   return (
    <Box
    style={{
      display: "flex",
      flexDirection: "row",
      flexGrow: 1,
    }}
    m={1}>
    <Grid
      container
      spacing={1}
      style={{
        height:height - theme.spacing(1)*2.5,
        justifyContent:"center",
        backgroundColor: theme.palette.background.default,
      }}>
      {[...participants.keys()].map((participantId) => {
        return (
          <Grid
            item
            style={{
              height: participants.size < 3
                ? height - theme.spacing(1)*2
                : participants.size < 5
                ? height/2 - theme.spacing(1)*2
                : participants.size < 7
                ? height/2 - theme.spacing(1)*2
                : participants.size < 9
                ? height/2 - theme.spacing(1)*2
                : height/3 - theme.spacing(1)*2
            }}
            xs={
              participants.size < 2
                ? 8
                : participants.size < 5
                ? 6
                : participants.size < 7
                ? 4
                :participants.size <9
                ? 3
                : 3
            }>
            <ParticipantView participantId={participantId} />
          </Grid>
        );
      })}
    </Grid>
  </Box>
   )
}