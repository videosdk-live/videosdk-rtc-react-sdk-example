import { useEffect } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { useMeetingStore } from "./meetingStore";

/**
 * Sits inside MeetingProvider, bridges useMeeting reactive state
 * and SDK methods into the global Zustand store.
 *
 * HLS state (hlsState / hlsUrls) is intentionally owned ONLY by the
 * onHlsStateChanged callback and NOT by the reactive sync below.
 * Mixing both causes a race: the reactive value (which can be stale for a
 * viewer joining mid-stream) overwrites the callback's correct value.
 */
export function MeetingStoreBridge() {
  const setMeetingState = useMeetingStore((s) => s.setMeetingState);

  const {
    participants,
    localParticipant,
    isMeetingJoined,
    presenterId,
    activeSpeakerId,
    pinnedParticipants,
    recordingState,
    meetingId,
    localMicOn,
    localWebcamOn,
    localScreenShareOn,
    leave,
    toggleMic,
    changeMic,
    toggleWebcam,
    changeWebcam,
    toggleScreenShare,
    startRecording,
    stopRecording,
    startHls,
    stopHls,
  } = useMeeting({
    onHlsStateChanged: (data) => {
      setMeetingState({
        hlsState: data.status,
        hlsUrls: data.downstreamUrl ? { downstreamUrl: data.downstreamUrl } : null,
      });
    },
  });

  // Sync reactive state whenever SDK values change
  useEffect(() => {
    setMeetingState({
      participants,
      localParticipant,
      isMeetingJoined,
      presenterId,
      activeSpeakerId,
      pinnedParticipants,
      recordingState,
      meetingId,
      localMicOn,
      localWebcamOn,
      localScreenShareOn,
    });
  }, [
    participants,
    localParticipant,
    isMeetingJoined,
    presenterId,
    activeSpeakerId,
    pinnedParticipants,
    recordingState,
    meetingId,
    localMicOn,
    localWebcamOn,
    localScreenShareOn,
  ]);

  // Sync SDK methods once they are available (stable references)
  useEffect(() => {
    if (leave) {
      setMeetingState({
        leave,
        toggleMic,
        changeMic,
        toggleWebcam,
        changeWebcam,
        toggleScreenShare,
        startRecording,
        stopRecording,
        startHls,
        stopHls,
      });
    }
  }, [leave, toggleMic, changeMic, toggleWebcam, changeWebcam, toggleScreenShare, startRecording, stopRecording, startHls, stopHls]);

  return null;
}
