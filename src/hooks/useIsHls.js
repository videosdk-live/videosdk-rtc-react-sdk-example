import { Constants, useMeeting } from "@videosdk.live/react-sdk";
import { useMemo } from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";

const useIsHls = () => {
  const { hlsState } = useMeeting();
  const {canPlay} = useMeetingAppContext()
  const isHls = useMemo(
    () =>
      hlsState === Constants.hlsEvents.HLS_STARTED || canPlay ||
      hlsState === Constants.hlsEvents.HLS_STOPPING,
    [hlsState]
  );

  return isHls;
};

export default useIsHls;
