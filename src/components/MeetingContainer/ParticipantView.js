import React, { useEffect, useRef } from "react";
import { Grid, useTheme } from "@material-ui/core";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import { nameTructed } from "../../utils/helper";
import useResponsiveSize from "../../utils/useResponsiveSize";
import { MicOff } from "@material-ui/icons";

function ParticipantView({ participantId }) {
  const webcamRef = useRef(null);
  const micRef = useRef(null);

  const dpSize = useResponsiveSize({
    xl: 92,
    lg: 52,
    md: 52,
    sm: 52,
    xs: 52,
  });

  const { displayName, webcamStream, micStream, webcamOn, micOn, isLocal } =
    useParticipant(participantId);
  const mMeeting = useMeeting();
  const isPresenting = mMeeting.isPresenting;

  useEffect(() => {
    if (webcamRef.current) {
      if (webcamOn && webcamStream) {
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
      if (micOn && micStream) {
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
    <div className="h-full w-full bg-gray-750 relative overflow-hidden rounded-lg">
      <div
        className="absolute bottom-2 left-2 rounded-md flex items-center justify-center p-2"
        style={{
          backgroundColor: "#00000066",
          transition: "all 200ms",
          transitionTimingFunction: "linear",
        }}
      >
        {!micOn ? <MicOff fontSize="small" color="primary"></MicOff> : <></>}

        <p className="text-sm text-white">
          {isPresenting
            ? isLocal
              ? `You are presenting`
              : `${nameTructed(displayName, 15)} is presenting`
            : isLocal
            ? "You"
            : nameTructed(displayName, 26)}
        </p>
      </div>
      <audio ref={micRef} autoPlay />
      {webcamOn ? (
        <video
          // height="100%"
          // width={"100%"}
          ref={webcamRef}
          autoPlay
          className="w-full h-full"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div
            className={`z-10 flex items-center justify-center rounded-full bg-gray-800`}
            style={{
              height: dpSize,
              width: dpSize,
              transition: "height 800ms, width 800ms",
              transitionTimingFunction: "ease-in-out",
            }}
          >
            <p className="text-2xl text-white">
              {String(displayName).charAt(0).toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ParticipantsViewer({ height }) {
  const theme = useTheme();
  const mMeeting = useMeeting();
  const participants = mMeeting?.participants;
  const isXStoSM = theme.breakpoints.between("xs", "sm");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isXStoSM ? "column" : "row",
        flexGrow: 1,
        margin: 8,
      }}
    >
      <Grid
        container
        spacing={2}
        style={{
          height: height - theme.spacing(1),
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.palette.darkTheme.main,
        }}
      >
        {[...participants.keys()].map((participantId) => {
          return (
            <Grid
              key={`participant_${participantId}`}
              item
              style={{
                height:
                  participants.size < 3
                    ? height - theme.spacing(1) * 8
                    : participants.size < 5
                    ? height / 2 - theme.spacing(1) * 2
                    : participants.size < 7
                    ? height / 2 - theme.spacing(1) * 2
                    : participants.size < 9
                    ? height / 2 - theme.spacing(1) * 2
                    : height / 3 - theme.spacing(1) * 2,
              }}
              xs={
                participants.size < 2
                  ? 8
                  : participants.size < 5
                  ? 6
                  : participants.size < 7
                  ? 4
                  : participants.size < 9
                  ? 3
                  : 3
              }
            >
              <ParticipantView participantId={participantId} />
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
