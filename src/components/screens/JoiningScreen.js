import React, { useEffect, useRef, useState } from "react";
import { MeetingDetailsScreen } from "../MeetingDetailsScreen";
import { createMeeting, getToken, validateMeeting } from "../../api";
import ConfirmBox from "../ConfirmBox";
import { Constants, useMediaDevice } from "@videosdk.live/react-sdk";
import useMediaStream from "../../hooks/useMediaStream";
import useIsMobile from "../../hooks/useIsMobile";
import WebcamOffIcon from "../../icons/WebcamOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import MicOffIcon from "../../icons/MicOffIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";
import MicPermissionDenied from "../../icons/MicPermissionDenied";
import CameraPermissionDenied from "../../icons/CameraPermissionDenied";
import DropDown from "../DropDown";
import DropDownCam from "../DropDownCam";
import DropDownSpeaker from "../DropDownSpeaker";
import NetworkStats from "../NetworkStats";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { toast } from "react-toastify";

export function JoiningScreen({
  participantName,
  setParticipantName,
  setMeetingId,
  setToken,
  onClickStartMeeting,
  micOn,
  webcamOn,
  setWebcamOn,
  setMicOn,
  customAudioStream,
  setCustomAudioStream,
  setCustomVideoStream,
}) {
  const {
    selectedWebcam,
    selectedMic,
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setIsCameraPermissionAllowed,
    setIsMicrophonePermissionAllowed,
  } = useMeetingAppContext();

  const [{ webcams, mics, speakers }, setDevices] = useState({
    webcams: [],
    mics: [],
    speakers: [],
  });
  const { getVideoTrack, getAudioTrack } = useMediaStream();
  const {
    checkPermissions,
    getCameras,
    getMicrophones,
    requestPermission,
    getPlaybackDevices,
  } = useMediaDevice({ onDeviceChanged });
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);
  const [didDeviceChange, setDidDeviceChange] = useState(false);

  const videoPlayerRef = useRef();
  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();
  const permissonAvaialble = useRef();
  const webcamRef = useRef();
  const micRef = useRef();
  const isMobile = useIsMobile();

  useEffect(() => {
    webcamRef.current = webcamOn;
  }, [webcamOn]);

  useEffect(() => {
    micRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    permissonAvaialble.current = {
      isCameraPermissionAllowed,
      isMicrophonePermissionAllowed,
    };
  }, [isCameraPermissionAllowed, isMicrophonePermissionAllowed]);

  useEffect(() => {
    if (micOn) {
      audioTrackRef.current = audioTrack;
      startMuteListener();
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (webcamOn) {
      videoTrackRef.current = videoTrack;

      var isPlaying =
        videoPlayerRef.current.currentTime > 0 &&
        !videoPlayerRef.current.paused &&
        !videoPlayerRef.current.ended &&
        videoPlayerRef.current.readyState >
          videoPlayerRef.current.HAVE_CURRENT_DATA;

      if (videoTrack) {
        const videoSrcObject = new MediaStream([videoTrack]);

        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = videoSrcObject;
          if (videoPlayerRef.current.pause && !isPlaying) {
            videoPlayerRef.current
              .play()
              .catch((error) => console.log("error", error));
          }
        }
      } else {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = null;
        }
      }
    }
  }, [webcamOn, videoTrack]);

  useEffect(() => {
    getCameraDevices();
  }, [isCameraPermissionAllowed]);

  useEffect(() => {
    getAudioDevices();
  }, [isMicrophonePermissionAllowed]);

  useEffect(() => {
    checkMediaPermission();
    return () => {};
  }, []);

  const _toggleWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (webcamOn) {
      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
        setCustomVideoStream(null);
        setWebcamOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const _toggleMic = () => {
    const audioTrack = audioTrackRef.current;

    if (micOn) {
      if (audioTrack) {
        audioTrack.stop();
        setAudioTrack(null);
        setCustomAudioStream(null);
        setMicOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };

  const changeWebcam = async (deviceId) => {
    if (webcamOn) {
      const currentvideoTrack = videoTrackRef.current;
      if (currentvideoTrack) {
        currentvideoTrack.stop();
      }

      const stream = await getVideoTrack({
        webcamId: deviceId,
      });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      const videoTrack = videoTracks?.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
    }
  };
  const changeMic = async (deviceId) => {
    
    
    if (micOn) {
      const currentAudioTrack = audioTrackRef.current;
      currentAudioTrack && currentAudioTrack.stop();
      const stream = await getAudioTrack({
        micId: deviceId,
      });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      const audioTrack = audioTracks.length ? audioTracks[0] : null;
      clearInterval(audioAnalyserIntervalRef.current);
      setAudioTrack(audioTrack);
    }
  };

  const getDefaultMediaTracks = async ({ mic, webcam }) => {
    
    if (mic) {
      const stream = await getAudioTrack({
        micId: selectedMic.id,
      });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      const audioTrack = audioTracks.length ? audioTracks[0] : null;
      setAudioTrack(audioTrack);
    }

    if (webcam) {
      const stream = await getVideoTrack({
        webcamId: selectedWebcam.id,
      });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      const videoTrack = videoTracks?.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
    }
  };

  async function startMuteListener() {
    const currentAudioTrack = audioTrackRef.current;
    if (currentAudioTrack) {
      if (currentAudioTrack.muted) {
        setDlgMuted(true);
      }
      currentAudioTrack.addEventListener("mute", (ev) => {
        setDlgMuted(true);
      });
    }
  }

  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  async function requestAudioVideoPermission(mediaType) {
    try {
      const permission = await requestPermission(mediaType);

      // For Video
      if (isFirefox) {
        const isVideoAllowed = permission.get("video");
        setIsCameraPermissionAllowed(isVideoAllowed);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
      }

      // For Audio
      if (isFirefox) {
        const isAudioAllowed = permission.get("audio");
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }

      if (mediaType === Constants.permission.AUDIO) {
        const isAudioAllowed = permission.get(Constants.permission.AUDIO);
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }

      if (mediaType === Constants.permission.VIDEO) {
        const isVideoAllowed = permission.get(Constants.permission.VIDEO);
        setIsCameraPermissionAllowed(isVideoAllowed);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
      }
    } catch (ex) {
      console.log("Error in requestPermission", ex);
    }
  }
  function onDeviceChanged() {
    setDidDeviceChange(true);
    getCameraDevices();
    getAudioDevices();
    getDefaultMediaTracks({ mic: micRef.current, webcam: webcamRef.current });
  }

  const checkMediaPermission = async () => {
    try {
      const checkAudioVideoPermission = await checkPermissions();
      const cameraPermissionAllowed = checkAudioVideoPermission.get(
        Constants.permission.VIDEO
      );
      const microphonePermissionAllowed = checkAudioVideoPermission.get(
        Constants.permission.AUDIO
      );

      setIsCameraPermissionAllowed(cameraPermissionAllowed);
      setIsMicrophonePermissionAllowed(microphonePermissionAllowed);

      if (microphonePermissionAllowed) {
        setMicOn(true);
        getDefaultMediaTracks({ mic: true, webcam: false });
      } else {
        await requestAudioVideoPermission(Constants.permission.AUDIO);
      }
      if (cameraPermissionAllowed) {
        setWebcamOn(true);
        getDefaultMediaTracks({ mic: false, webcam: true });
      } else {
        await requestAudioVideoPermission(Constants.permission.VIDEO);
      }
    } catch (error) {
      // For firefox, it will request audio and video simultaneously.
      await requestAudioVideoPermission();
      console.log(error);
    }
  };

  const getCameraDevices = async () => {
    try {
      if (permissonAvaialble.current?.isCameraPermissionAllowed) {
        let webcams = await getCameras();
        setSelectedWebcam({
          id: webcams[0]?.deviceId,
          label: webcams[0]?.label,
        });
        setDevices((devices) => {
          return { ...devices, webcams };
        });
      }
    } catch (err) {
      console.log("Error in getting camera devices", err);
    }
  };

  

  const getAudioDevices = async () => {
    try {
      if (permissonAvaialble.current?.isMicrophonePermissionAllowed) {
        let mics = await getMicrophones();
        console.log(mics)
        let speakers = await getPlaybackDevices();
        const hasMic = mics.length > 0;
        if (hasMic) {
          startMuteListener();
        }
        await setSelectedSpeaker({
          id: speakers[0]?.deviceId,
          label: speakers[0]?.label,
        });
        await setSelectedMic({ id: mics[0]?.deviceId, label: mics[0]?.label });
        setDevices((devices) => {
          return { ...devices, mics, speakers };
        });
      }
    } catch (err) {
      console.log("Error in getting audio devices", err); 
    }
  };


  useEffect(()=> {
   getAudioDevices()
  }, [])

  const ButtonWithTooltip = ({ onClick, onState, OnIcon, OffIcon }) => {
    const btnRef = useRef();
    return (
      <>
        <div>
          <button
            ref={btnRef}
            onClick={onClick}
            className={`rounded-full min-w-auto w-12 h-12 flex items-center justify-center 
            ${onState ? "bg-white" : "bg-red-650 text-white"}`}
          >
            {onState ? (
              <OnIcon fillcolor={onState ? "#050A0E" : "#fff"} />
            ) : (
              <OffIcon fillcolor={onState ? "#050A0E" : "#fff"} />
            )}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0">
      <div className="overflow-y-auto flex flex-col flex-1 h-screen bg-gray-800">
        <div className="flex flex-1 flex-col md:flex-row items-center justify-center md:m-[72px] m-16">
          <div className="container grid  md:grid-flow-col grid-flow-row ">
            <div className="grid grid-cols-12">
              <div className="md:col-span-7 2xl:col-span-7 col-span-12">
                <div className="flex items-center justify-center p-1.5 sm:p-4 lg:p-6">
                  <div className="relative w-full md:pl-4 sm:pl-10 pl-5  md:pr-4 sm:pr-10 pr-5">
                    <div className="w-full relative" style={{ height: "55vh" }}>
                      <video
                        autoPlay
                        playsInline
                        muted
                        ref={videoPlayerRef}
                        controls={false}
                        style={{
                          backgroundColor: "#1c1c1c",
                        }}
                        className={
                          "rounded-[10px] h-full w-full object-cover flex items-center justify-center flip"
                        }
                      />
                      {!isMobile ? (
                        <>
                          <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
                            {!webcamOn ? (
                              <p className="text-xl xl:text-lg 2xl:text-xl text-white">
                                The camera is off
                              </p>
                            ) : null}
                          </div>
                        </>
                      ) : null}

                      <div className="absolute xl:bottom-6 bottom-4 left-0 right-0">
                        <div className="container grid grid-flow-col space-x-4 items-center justify-center md:-m-2">
                          {isMicrophonePermissionAllowed ? (
                            <ButtonWithTooltip
                              onClick={_toggleMic}
                              onState={micOn}
                              mic={true}
                              OnIcon={MicOnIcon}
                              OffIcon={MicOffIcon}
                            />
                          ) : (
                            <MicPermissionDenied />
                          )}

                          {isCameraPermissionAllowed ? (
                            <ButtonWithTooltip
                              onClick={_toggleWebcam}
                              onState={webcamOn}
                              mic={false}
                              OnIcon={WebcamOnIcon}
                              OffIcon={WebcamOffIcon}
                            />
                          ) : (
                            <CameraPermissionDenied />
                          )}
                        </div>
                      </div>
                    </div>

                    {!isMobile && (
                      <>
                        <div className="absolute top-2 right-10">
                          <NetworkStats />
                        </div>

                        <div className="flex mt-3">
                          {!isFirefox && (
                            <>
                              <DropDown
                                mics={mics}
                                changeMic={changeMic}
                                customAudioStream={customAudioStream}
                                audioTrack={audioTrack}
                                micOn={micOn}
                                didDeviceChange={didDeviceChange}
                                setDidDeviceChange={setDidDeviceChange}
                              />
                              <DropDownSpeaker speakers={speakers} />
                              <DropDownCam
                                changeWebcam={changeWebcam}
                                webcams={webcams}
                              />
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 2xl:col-span-5 col-span-12 md:relative">
                <div className="flex flex-1 flex-col items-center justify-center xl:m-16 lg:m-6 md:mt-9 lg:mt-14 xl:mt-20 mt-3 md:absolute md:left-0 md:right-0 md:top-0 md:bottom-0">
                  <MeetingDetailsScreen
                    participantName={participantName}
                    setParticipantName={setParticipantName}
                    videoTrack={videoTrack}
                    setVideoTrack={setVideoTrack}
                    onClickStartMeeting={onClickStartMeeting}
                    onClickJoin={async (id) => {
                      const token = await getToken();
                      const { meetingId, err } = await validateMeeting({
                        roomId: id,
                        token,
                      });
                      if (meetingId === id) {
                        setToken(token);
                        setMeetingId(id);
                        onClickStartMeeting();
                      } else {
                        toast(`${err}`, {
                          position: "bottom-left",
                          autoClose: 4000,
                          hideProgressBar: true,
                          closeButton: false,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "light",
                        });
                      }
                    }}
                    _handleOnCreateMeeting={async () => {
                      const token = await getToken();
                      const { meetingId, err } = await createMeeting({ token });

                      if (meetingId) {
                        setToken(token);
                        setMeetingId(meetingId);
                      }
                      return { meetingId: meetingId, err: err };
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmBox
        open={dlgMuted}
        successText="OKAY"
        onSuccess={() => {
          setDlgMuted(false);
        }}
        title="System mic is muted"
        subTitle="You're default microphone is muted, please unmute it or increase audio
            input volume from system settings."
      />
      <ConfirmBox
        open={dlgDevices}
        successText="DISMISS"
        onSuccess={() => {
          setDlgDevices(false);
        }}
        title="Mic or webcam not available"
        subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
      />
    </div>
  );
}
