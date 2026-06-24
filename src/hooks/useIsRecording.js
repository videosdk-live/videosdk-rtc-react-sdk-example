import { useMemo } from "react";
import { Constants } from "@videosdk.live/react-sdk";
import { useMeetingStore } from "../store/meetingStore";

const useIsRecording = () => {
  const recordingState = useMeetingStore((s) => s.recordingState);

  const isRecording = useMemo(
    () =>
      recordingState === Constants.recordingEvents.RECORDING_STARTED ||
      recordingState === Constants.recordingEvents.RECORDING_STOPPING,
    [recordingState]
  );

  return isRecording;
};

export default useIsRecording;
