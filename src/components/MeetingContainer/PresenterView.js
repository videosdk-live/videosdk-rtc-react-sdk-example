import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { MicOff, ScreenShare } from "@material-ui/icons";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useMemo, useRef } from "react";
import ReactPlayer from "react-player";
import { nameTructed } from "../../utils/helper";

export function PresenterView({ height }) {
  const mMeeting = useMeeting();
  const presenterId = mMeeting?.presenterId;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.between("xs", "sm"));

  // const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });

  const mobilePortrait = isMobile;

  const videoPlayer = useRef();

  const {
    micOn,
    isLocal,
    screenShareStream,
    screenShareAudioStream,
    screenShareOn,
    displayName,
  } = useParticipant(presenterId);

  const mediaStream = useMemo(() => {
    if (screenShareOn) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      return mediaStream;
    }
  }, [screenShareStream, screenShareOn]);

  const audioPlayer = useRef();

  useEffect(() => {
    if (
      !isLocal &&
      audioPlayer.current &&
      screenShareOn &&
      screenShareAudioStream
    ) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareAudioStream.track);

      audioPlayer.current.srcObject = mediaStream;
      audioPlayer.current.play().catch((err) => {
        if (
          err.message ===
          "play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD"
        ) {
          console.error("audio" + err.message);
        }
      });
    } else {
      audioPlayer.current.srcObject = null;
    }
  }, [screenShareAudioStream, screenShareOn, isLocal]);

  return (
    <div
      style={{
        height: height - theme.spacing(4),
        // width: "700px",
        width: "100%",
        backgroundColor: theme.palette.darkTheme.slightLighter,
        position: "relative",
        overflow: "hidden",
        borderRadius: theme.spacing(1),
        margin: theme.spacing(1),
      }}
      className={"video-cover"}
      // className="mt-1 h-full w-full relative flex items-center justify-center bg-gray-750 rounded-lg "
    >
      <audio autoPlay playsInline controls={false} ref={audioPlayer} />
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
        }}
        className={"video-contain"}
      >
        <ReactPlayer
          ref={videoPlayer}
          //
          playsinline // very very imp prop
          playIcon={<></>}
          //
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          //
          url={mediaStream}
          //
          height={"100%"}
          width={"100%"}
          style={{
            filter: isLocal ? "blur(1rem)" : undefined,
          }}
          onError={(err) => {
            console.log(err, "presenter video error");
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: theme.spacing(1),
            left: theme.spacing(1),
            backgroundColor: theme.palette.darkTheme.main,
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
              backgroundColor: theme.palette.darkTheme.slightLighter,
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
                style={{
                  backgroundColor: theme.palette.primary.primaryMain,
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
    </div>
  );

  return (
    <div
      style={{
        height: height - theme.spacing(2),
        width: "100%",
        backgroundColor: theme.palette.darkTheme.slightLighter,
        position: "relative",
        borderRadius: theme.spacing(1),
        margin: theme.spacing(1),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      // className={"video-cover"}
    >
      <audio autoPlay playsInline controls={false} ref={audioPlayer} />
      <div
        style={{
          height: mobilePortrait ? "50%" : "100%",
          width: "100%",
          position: "relative",
        }}
        // className={"video-contain"}
      >
        <ReactPlayer
          ref={videoPlayer}
          //
          playsinline // very very imp prop
          playIcon={<></>}
          //
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          //
          url={mediaStream}
          //
          height={"100%"}
          width={"100%"}
          style={{
            filter: isLocal ? "blur(1rem)" : undefined,
          }}
          onError={(err) => {
            console.log(err, "presenter video error");
          }}
        />
        {/* <video
          height={"100%"}
          width={"100%"}
          ref={videoPlayer}
          autoPlay
          style={{
            filter: isLocal ? "blur(1rem)" : undefined,
            objectFit: "cover",
            objectPosition: "center center",
          }}
        /> */}
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
    </div>
  );
}
