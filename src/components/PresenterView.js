import { useMeeting, useParticipant, VideoPlayer } from "@videosdk.live/react-sdk";
import { useEffect, useRef } from "react";
import MicOffSmallIcon from "../icons/MicOffSmallIcon";
import ScreenShareIcon from "../icons/ScreenShareIcon";
import SpeakerIcon from "../icons/SpeakerIcon";
import { nameTructed } from "../utils/helper";
import { CornerDisplayName } from "./ParticipantView";

const PresenterAudioPlayer = ({ presenterId }) => {
  const { isLocal, screenShareAudioStream, screenShareOn } =
    useParticipant(presenterId);

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

  return <audio autoPlay playsInline controls={false} ref={audioPlayer} />;
};

const StopPresentingOverlay = ({ presenterId, toggleScreenShare }) => {
  const { isLocal } = useParticipant(presenterId);

  if (!isLocal) return null;

  return (
    <>
      <div className="p-10 rounded-2xl flex flex-col items-center justify-center absolute top-1/2 left-1/2 bg-gray-750 transform -translate-x-1/2 -translate-y-1/2">
        <ScreenShareIcon style={{ height: 48, width: 48, color: "white" }} />
        <div className="mt-4">
          <p className="text-white text-xl font-semibold">
            You are presenting to everyone
          </p>
        </div>
        <div className="mt-8">
          <button
            className="bg-purple-550 text-white px-4 py-2 rounded text-sm text-center font-medium"
            onClick={(e) => {
              e.stopPropagation();
              toggleScreenShare();
            }}
          >
            STOP PRESENTING
          </button>
        </div>
      </div>
      <CornerDisplayName
        {...{
          participantId: presenterId,
          isPresenting: true,
          mouseOver: true,
        }}
      />
    </>
  );
};


const PresenterContent = ({ presenterId }) => {
  const { isLocal, micOn, displayName, isActiveSpeaker } =
    useParticipant(presenterId);

  return (
    <div className={"video-contain absolute h-full w-full"}>
      <VideoPlayer
        participantId={presenterId}
        type="share"
        containerStyle={{
          height: "100%",
          width: "100%",
        }}
        className="h-full"
        classNameVideo="h-full"
        videoStyle={{
          filter: isLocal ? "blur(1rem)" : undefined,
        }}
      />

      <div
        className="bottom-2 left-2 bg-gray-750 p-2 absolute rounded-md flex items-center justify-center"
        style={{
          transition: "all 200ms",
          transitionTimingFunction: "linear",
        }}
      >
        {!micOn ? (
          <MicOffSmallIcon fillcolor="white" />
        ) : micOn && isActiveSpeaker ? (
          <SpeakerIcon />
        ) : (
          <></>
        )}

        <p className="text-sm text-white">
          {isLocal
            ? `You are presenting`
            : `${nameTructed(displayName, 15)} is presenting`}
        </p>
      </div>
    </div>
  );
};

export function PresenterView({ height }) {
  const { presenterId, toggleScreenShare } = useMeeting();

  return (
    <div
      className={` bg-gray-750 rounded m-2 relative overflow-hidden w-full h-[${height - "xl:p-6 lg:p-[52px] md:p-[26px] p-1"
        }] `}
    >
      <PresenterAudioPlayer presenterId={presenterId} />
      <PresenterContent presenterId={presenterId} />
      <StopPresentingOverlay
        presenterId={presenterId}
        toggleScreenShare={toggleScreenShare}
      />
    </div>
  );
}
