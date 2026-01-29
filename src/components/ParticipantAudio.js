import { useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useRef } from "react";

/**
 * ParticipantAudio - Renders ONLY audio for a participant
 * Use this for participants not visible on the current page
 * to ensure you can still hear them speaking
 */
export function ParticipantAudio({ key, participantId }) {
  // Getting participant properties
  const { micStream, isLocal, screenShareAudioStream } =
    useParticipant(participantId);

  const micRef = useRef(null);
  const sharedAudioRef = useRef(null);

  const attachAudio = (audioEl, stream) => {
    if (!audioEl) return;

    if (!stream) {
      audioEl.srcObject = null;
      return;
    }

    const mediaStream = new MediaStream([stream.track]);
    audioEl.srcObject = mediaStream;

    audioEl.play().catch((err) => {
      console.error("Audio play failed", err);
    });
  };

  useEffect(() => {
    attachAudio(micRef.current, micStream);

    return () => {
      if (micRef.current?.srcObject) {
        micRef.current.srcObject.getTracks().forEach((t) => t.stop());
        micRef.current.srcObject = null;
      }
    };
  }, [micStream]);

  useEffect(() => {
    attachAudio(sharedAudioRef.current, screenShareAudioStream);

    return () => {
      if (sharedAudioRef.current?.srcObject) {
        sharedAudioRef.current.srcObject.getTracks().forEach((t) => t.stop());
        sharedAudioRef.current.srcObject = null;
      }
    };
  }, [screenShareAudioStream]);

  return (
    <>
      {micStream && (
        <audio
          key={key + "audio"}
          ref={micRef}
          autoPlay
          playsInline
          muted={isLocal}
        />
      )}

      {screenShareAudioStream && (
        <audio
          key={key + "sharedAudio"}
          ref={sharedAudioRef}
          autoPlay
          playsInline
        />
      )}
    </>
  );
}
