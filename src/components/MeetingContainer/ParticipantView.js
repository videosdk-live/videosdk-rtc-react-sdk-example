import React, { useEffect, useMemo, useRef } from "react";
import { Grid, useTheme } from "@material-ui/core";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import { nameTructed } from "../../utils/helper";
import { MicOff } from "@material-ui/icons";
import ReactPlayer from "react-player";

function ParticipantView({ participantId }) {
  const { displayName, webcamStream, micStream, webcamOn, micOn, isLocal } =
    useParticipant(participantId);
  const micRef = useRef(null);
  const mMeeting = useMeeting();
  const isPresenting = mMeeting.isPresenting;

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
      className={`h-full w-full  bg-gray-750 relative overflow-hidden rounded-lg video-cover`}
    >
      <div
        className="absolute bottom-2 left-2 rounded-md flex items-center justify-center p-2"
        style={{
          backgroundColor: "#00000066",
          transition: "all 200ms",
          transitionTimingFunction: "linear",
        }}
      >
        {!micOn ? (
          <MicOff fontSize="small" style={{ color: "white" }}></MicOff>
        ) : (
          <></>
        )}
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
    </div>
  );
}
export function ParticipantsViewer({ isPresenting, sideBarMode }) {
  const theme = useTheme();
  const mMeeting = useMeeting();

  // isPresenting
  // ? [...mMeeting?.participants?.keys()].slice(0, 2)
  // :
  const participants = mMeeting?.participants;
  const isXStoSM = theme.breakpoints.between("xs", "sm");
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  const perRow =
    isMobile || isPresenting
      ? participants.size < 4
        ? 1
        : participants.size < 9
        ? 2
        : 3
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
        participants.size < 2 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-2"
          : participants.size < 4 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-10"
          : participants.size > 4 && !sideBarMode && !isPresenting
          ? "md:px-14"
          : "md:px-0"
      }`}
    >
      <div className="flex flex-col w-full h-full">
        {Array.from(
          { length: Math.ceil(participants.size / perRow) },
          (_, i) => {
            return (
              <div
                className={`flex flex-1 ${
                  isPresenting
                    ? participants.size === 1
                      ? "justify-start items-start"
                      : "items-center justify-center"
                    : "items-center justify-center"
                }`}
              >
                {[...participants.keys()]
                  .slice(i * perRow, (i + 1) * perRow)
                  .map((participantId) => {
                    return (
                      <div
                        key={`participant_${participantId}`}
                        className={`flex flex-1 ${
                          isPresenting
                            ? participants.size === 1
                              ? "md:h-34 md:w-32 xl:w-52 xl:h-48 "
                              : participants.size === 2
                              ? "md:w-36 xl:w-56"
                              : "md:w-32 xl:w-48"
                            : "w-full"
                        } items-center justify-center h-full ${
                          participants.size === 1
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
