import React, { useEffect, useMemo, useRef, useState } from "react";

import { useTheme } from "@material-ui/core";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import { CornerDisplayName } from "../../interactive-live-streaming/components/ILSParticipantView";

function ParticipantView({ participantId }) {
  const { displayName, webcamStream, micStream, webcamOn, micOn, isLocal } =
    useParticipant(participantId);
  const micRef = useRef(null);
  const mMeeting = useMeeting();

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
  const webcamMediaStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);
  return (
    <div
      onMouseEnter={() => {
        setMouseOver(true);
      }}
      onMouseLeave={() => {
        setMouseOver(false);
      }}
      className={`h-full w-full  bg-gray-750 relative overflow-hidden rounded-lg video-cover`}
    >
      <audio ref={micRef} autoPlay muted={isLocal} />
      {webcamOn ? (
        <ReactPlayer
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
          url={webcamMediaStream}
          //
          height={"100%"}
          width={"100%"}
          // style={flipStyle}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
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
      <CornerDisplayName
        {...{
          isLocal,
          displayName,
          micOn,
          webcamOn,
          isPresenting: false,
          participantId,
          mouseOver,
        }}
      />
    </div>
  );
}
export function ParticipantsViewer({ isPresenting, sideBarMode }) {
  const theme = useTheme();
  const mMeeting = useMeeting();

  const participants = isPresenting
    ? [...mMeeting?.participants.keys()].slice(0, 6)
    : [...mMeeting?.participants.keys()];

  const isXStoSM = theme.breakpoints.between("xs", "sm");
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  const perRow =
    isMobile || isPresenting
      ? participants.length < 4
        ? 1
        : participants.length < 9
        ? 2
        : 3
      : participants.length < 5
      ? 2
      : participants.length < 7
      ? 3
      : participants.length < 9
      ? 4
      : participants.length < 10
      ? 3
      : participants.length < 11
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
        participants.length < 2 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-2"
          : participants.length < 4 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-10"
          : participants.length > 4 && !sideBarMode && !isPresenting
          ? "md:px-14"
          : "md:px-0"
      }`}
    >
      <div className="flex flex-col w-full h-full">
        {Array.from(
          { length: Math.ceil(participants.length / perRow) },
          (_, i) => {
            return (
              <div
                key={`participant-${i}`}
                className={`flex flex-1 ${
                  isPresenting
                    ? participants.length === 1
                      ? "justify-start items-start"
                      : "items-center justify-center"
                    : "items-center justify-center"
                }`}
              >
                {participants
                  .slice(i * perRow, (i + 1) * perRow)
                  .map((participantId) => {
                    return (
                      <div
                        key={`participant_${participantId}`}
                        className={`flex flex-1 ${
                          isPresenting
                            ? participants.length === 1
                              ? "md:h-48 md:w-44 xl:w-52 xl:h-48 "
                              : participants.length === 2
                              ? "md:w-44 xl:w-56"
                              : "md:w-44 xl:w-48"
                            : "w-full"
                        } items-center justify-center h-full ${
                          participants.length === 1
                            ? "md:max-w-7xl 2xl:max-w-[1480px] "
                            : "md:max-w-lg 2xl:max-w-2xl"
                        } overflow-clip overflow-hidden  p-1`}
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
