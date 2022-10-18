import React, { useEffect, useRef } from "react";
import { Grid, useTheme } from "@material-ui/core";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import { nameTructed } from "../../utils/helper";
import { MicOff } from "@material-ui/icons";

function ParticipantView({ participantId }) {
  const { displayName, webcamStream, micStream, webcamOn, micOn, isLocal } =
    useParticipant(participantId);

  const webcamRef = useRef(null);
  const micRef = useRef(null);

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
    <div
      className={`h-full w-full bg-gray-750 relative overflow-hidden rounded-lg `}
    >
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
          ref={webcamRef}
          autoPlay
          className=" w-full h-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div
            className={`z-10 flex items-center justify-center rounded-full bg-gray-800 2xl:h-[92px] h-[52px] 2xl:w-[92px] w-[52px]`}
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

export function ParticipantsViewer({ isPresenting, sideBarMode }) {
  const theme = useTheme();
  const mMeeting = useMeeting();
  const participants = mMeeting?.participants;
  const isXStoSM = theme.breakpoints.between("xs", "sm");
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;
  const perRow =
    isMobile || isPresenting
      ? participants.size < 3
        ? 1
        : participants.size < 4 || participants.size < 9
        ? 2
        : 3
      : participants.size < 2
      ? 1
      : participants.size < 5
      ? 2
      : participants.size < 7
      ? 3
      : participants.size < 9
      ? 4
      : participants.size < 10
      ? 3
      : participants.size < 11
      ? 4
      : 4;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isXStoSM ? "column" : "row",
        flexGrow: 1,
        margin: 12,
        justifyContent: "center",
        alignItems: "center",
      }}
      className={`${
        participants.size < 2 && !sideBarMode
          ? "md:px-0"
          : participants.size < 4 && !sideBarMode
          ? "md:px-16"
          : participants.size > 4 && !sideBarMode
          ? "md:px-14"
          : "md:px-0"
      }`}
    >
      <div className="flex flex-col w-full h-full">
        {Array.from(
          { length: Math.ceil(participants.size / perRow) },
          (_, i) => {
            return (
              <div className="flex flex-1 justify-center items-center">
                {[...participants.keys()]
                  .slice(i * perRow, (i + 1) * perRow)
                  .map((participantId) => {
                    return (
                      <div
                        key={`participant_${participantId}`}
                        // className={`flex flex-1 w-full items-center justify-center h-full max-h-96 max-w-lg p-1`}
                        className={`flex flex-1 w-full h-full items-center justify-center  ${
                          participants.size < 2
                            ? "md:max-h-[530px] md:max-w-5xl"
                            : participants.size < 3
                            ? "md:max-h-96 md:max-w-4xl  "
                            : participants.size >= 3 && participants.size < 9
                            ? "md:max-h-[270px]"
                            : participants.size >= 9
                            ? "md:max-h-44  "
                            : "md:max-h-96  "
                        }  md:max-w-lg  p-1`}
                      >
                        <ParticipantView participantId={participantId} />
                      </div>
                    );
                  })}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
