import { createCameraVideoTrack } from "@videosdk.live/react-sdk";
import { useMeetingAppContext } from "../MeetingAppContextDef";

const useMediaStream = () => {
  const { selectedWebcamDevice, webCamResolution } = useMeetingAppContext();

  const getVideoTrack = async ({ webcamId, encoderConfig }) => {
    try {
      const track = await createCameraVideoTrack({
        cameraId: webcamId ? webcamId : selectedWebcamDevice.id,
        encoderConfig: encoderConfig ? encoderConfig : webCamResolution,
        optimizationMode: "motion",
        multiStream: false,
      });

      return track;
    } catch (error) {
      return null;
    }
  };

  return { getVideoTrack };
};

export default useMediaStream;
