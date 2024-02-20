import { createCameraVideoTrack , createMicrophoneAudioTrack } from "@videosdk.live/react-sdk";

const useMediaStream = () => {

  const getVideoTrack = async ({ webcamId, encoderConfig }) => {
    try {
      const track = await createCameraVideoTrack({
        cameraId: webcamId ,
        encoderConfig: encoderConfig ?  encoderConfig :"h540p_w960p",
        optimizationMode: "motion",
        multiStream: false,
      });

      return track;
    } catch(error) {
      return null;
    }
  };

  const getAudioTrack = async ({micId}) => {
    try{
      const track = await createMicrophoneAudioTrack({
        microphoneId: micId
      });
      return track;
    } catch(error) {
      return null;
    }
  };

  return { getVideoTrack,getAudioTrack };
};

export default useMediaStream;
