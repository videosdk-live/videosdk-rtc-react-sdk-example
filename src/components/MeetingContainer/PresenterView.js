import { Box, Button, Typography, useTheme } from "@material-ui/core";
import { MicOff, ScreenShare } from "@material-ui/icons";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useMemo, useRef } from "react";
import { nameTructed } from "../../utils/helper";

export function PresenterView({ height }) {
  const mMeeting = useMeeting();
  const presenterId = mMeeting?.presenterId;
  const theme = useTheme();

  const videoPlayer = useRef();
  const { micOn, isLocal, screenShareStream, screenShareOn, displayName } =
    useParticipant(presenterId);

  useEffect(() => {
    if (videoPlayer.current) {
      if (screenShareOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(screenShareStream.track);

        videoPlayer.current.srcObject = mediaStream;
        videoPlayer.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        videoPlayer.current.srcObject = null;
      }
    }
  }, [screenShareStream, screenShareOn]);

  return (
    <div
      style={{
        height: height - theme.spacing(4),
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        position: "relative",
        overflow: "hidden",
        borderRadius: theme.spacing(1),
        margin: theme.spacing(1),
      }}
      className={"video-cover"}
    >
      <video
        height={"100%"}
        width={"100%"}
        ref={videoPlayer}
        autoPlay
        style={{
          filter: isLocal ? "blur(1rem)" : undefined,
          objectFit: "cover",
          objectPosition: "center center",
        }}
      />
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
        }}
      >
        {!micOn ? <MicOff fontSize="small" color="primary"></MicOff> : <></>}

        <Typography variant="subtitle2">
          {isLocal
            ? `You are presenting`
            : `${nameTructed(displayName, 15)} is presenting`}
        </Typography>
      </div>
      {isLocal ? (
        <Box
          p={5}
          style={{
            borderRadius: theme.spacing(2),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            backgroundColor: "#333244",
          }}
        >
          <ScreenShare
            style={{
              color: theme.palette.common.white,
              height: theme.spacing(6),
              width: theme.spacing(6),
            }}
          />
          <Box mt={2}>
            <Typography
              variant="h6"
              style={{
                fontWeight: "bold",
                color: theme.palette.common.white,
              }}
            >
              You are presenting to everyone
            </Typography>
          </Box>
          <Box mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                mMeeting.toggleScreenShare();
              }}
            >
              Stop presenting
            </Button>
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </div>
  );
}
