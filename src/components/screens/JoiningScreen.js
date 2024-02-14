import React, { useEffect, useMemo, useRef, useState } from "react";
import { MeetingDetailsScreen } from "../MeetingDetailsScreen";
import { createMeeting, getToken, validateMeeting } from "../../api";
import ConfirmBox from "../ConfirmBox";
import {
  Constants,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  useMediaDevice,
} from "@videosdk.live/react-sdk";
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

export function JoiningScreen({
  participantName,
  setParticipantName,
  setMeetingId,
  setToken,
  setSelectedMic,
  setSelectedWebcam,
  onClickStartMeeting,
  micEnabled,
  webcamEnabled,
  setWebcamOn,
  setMicOn,
  setSelectedSpeaker,
  selectedSpeaker,
}) {
  const [{ webcams, mics, speakers }, setDevices] = useState({
    webcams: [],
    mics: [],
    speakers: [],
  });
  const [isCameraPermissionAllowed, setIsCameraPermissionAllowed] =
    useState(null);
  const [isMicrophonePermissionAllowed, setIsMicrophonePermissionAllowed] =
    useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);
  const [selectedWebcamLabel, setSelectedWebcamLabel] = useState(null);
  const [selectedSpeakerLabel, setSelectedSpeakerLabel] = useState(null);
  const [selectedMicLabel, setSelectedMicLabel] = useState(null);
  const [audioStream, setAudioStream] = useState(null);

  const videoPlayerRef = useRef();
  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();
  const permissonAvaialble = useRef();

  const {
    checkPermissions,
    getCameras,
    getMicrophones,
    requestPermission,
    getPlaybackDevices,
  } = useMediaDevice({ onDeviceChanged });

  useEffect(() => {
    permissonAvaialble.current = {
      isCameraPermissionAllowed,
      isMicrophonePermissionAllowed,
    };
  }, [isCameraPermissionAllowed, isMicrophonePermissionAllowed]);

  const isMobile = useIsMobile();
  const webcamOn = useMemo(() => !!videoTrack, [videoTrack]);
  const micOn = useMemo(() => !!audioTrack, [audioTrack]);

  const _handleTurnOffWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(null);
      setWebcamOn(false);
    }
  };
  const _handleTurnOnWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (!videoTrack) {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const _toggleWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (videoTrack) {
      _handleTurnOffWebcam();
    } else {
      _handleTurnOnWebcam();
    }
  };
  const _handleTurnOffMic = () => {
    const audioTrack = audioTrackRef.current;

    if (audioTrack) {
      audioTrack.stop();

      setAudioTrack(null);
      setMicOn(false);
    }
  };
  const _handleTurnOnMic = () => {
    const audioTrack = audioTrackRef.current;

    if (!audioTrack) {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };
  const _handleToggleMic = () => {
    const audioTrack = audioTrackRef.current;

    if (audioTrack) {
      _handleTurnOffMic();
    } else {
      _handleTurnOnMic();
    }
  };

  const changeWebcam = async (deviceId) => {
    const currentvideoTrack = videoTrackRef.current;

    if (currentvideoTrack) {
      currentvideoTrack.stop();
    }

    const stream = await createCameraVideoTrack({
      cameraId: deviceId,
    });

    const videoTracks = stream.getVideoTracks();
    const videoTrack = videoTracks.length ? videoTracks[0] : null;

    setVideoTrack(videoTrack);
  };
  const changeMic = async (deviceId) => {
    const currentAudioTrack = audioTrackRef.current;
    currentAudioTrack && currentAudioTrack.stop();
    const stream = await createMicrophoneAudioTrack({
      microphoneId: deviceId,
    });
    setAudioStream(stream);
    const audioTracks = stream.getAudioTracks();

    const audioTrack = audioTracks.length ? audioTracks[0] : null;
    clearInterval(audioAnalyserIntervalRef.current);

    setAudioTrack(audioTrack);
  };

  const getDefaultMediaTracks = async ({ mic, webcam, firstTime }) => {
    if (mic) {
      const stream = await createMicrophoneAudioTrack({});
      setAudioStream(stream);
      const audioTracks = stream.getAudioTracks();
      const audioTrack = audioTracks.length ? audioTracks[0] : null;
      setAudioTrack(audioTrack);
      if (firstTime) {
        setSelectedMic({
          id: audioTrack?.getSettings()?.deviceId,
        });
      }
    }

    if (webcam) {
      const stream = await createCameraVideoTrack({
        encoderConfig: "h720p_w1280p",
      });
      const videoTracks = stream.getVideoTracks();
      const videoTrack = videoTracks.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
      if (firstTime) {
        setSelectedWebcam({
          id: videoTrack?.getSettings()?.deviceId,
        });
      }
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

  // const getMediaDevices = async ({ micEnabled, webcamEnabled }) => {
  //   try {
  //     let webcams = [];
  //     let mics = [];
  //     let speakers = [];

  //     if (permissonAvaialble.current?.isCameraPermissionAllowed) {
  //       webcams = await getCameras();
  //     }

  //     if (permissonAvaialble.current?.isMicrophonePermissionAllowed) {
  //       mics = await getMicrophones();
  //       speakers = await getPlaybackDevices()
  //     }

  //     setSelectedWebcamLabel(webcams[0]?.label);
  //     setSelectedSpeakerLabel(speakers[0]?.label)
  //     setSelectedSpeaker({ id: speakers[0]?.deviceId });
  //     setSelectedMicLabel(mics[0]?.label);

  //     const hasMic = mics.length > 0;
  //     const hasWebcam = webcams.length > 0;

  //     setDevices({ webcams, mics, speakers });

  //     if (hasMic) {
  //       startMuteListener();
  //     }

  //     // getDefaultMediaTracks({
  //     //   mic: hasMic && micEnabled,
  //     //   webcam: hasWebcam && webcamEnabled,
  //     //   firstTime: true,
  //     // });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  useEffect(() => {
    audioTrackRef.current = audioTrack;
    startMuteListener();

    return () => {
      const currentAudioTrack = audioTrackRef.current;
      currentAudioTrack && currentAudioTrack.stop();
      audioTrackRef.current = null;
    };
  }, [audioTrack]);

  useEffect(() => {
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
  }, [videoTrack]);

  async function requestAudioVideoPermission(mediaType) {
    try {
      const permission = await requestPermission(mediaType);

      if (mediaType == Constants.permission.AUDIO) {
        setIsMicrophonePermissionAllowed(
          permission.get(Constants.permission.AUDIO)
        );
      }

      if (mediaType == Constants.permission.VIDEO) {
        setIsCameraPermissionAllowed(
          permission.get(Constants.permission.VIDEO)
        );
      }

      // if (permission.get(Constants.permission.AUDIO)) {
      //   setMicOn(true);
      // }

      // if (permission.get(Constants.permission.VIDEO)) {
      //   setWebcamOn(true);
      // }
    } catch (ex) {
      console.log("Error in requestPermission ", ex);
    }
  }
  function onDeviceChanged() {
    getCameraDevices();
    getAudioDevices();
    // getMediaDevices({ micEnabled, webcamEnabled });
    getDefaultMediaTracks({ mic: true, webcam: true });
  }

  const checkMediaPermission = async () => {
    const checkAudioVideoPermission = await checkPermissions();
    console.log("permission");
    const cameraPermissionAllowed = checkAudioVideoPermission.get(
      Constants.permission.VIDEO
    );

    const microphonePermissionAllowed = checkAudioVideoPermission.get(
      Constants.permission.AUDIO
    );

    setIsCameraPermissionAllowed(cameraPermissionAllowed);
    setIsMicrophonePermissionAllowed(microphonePermissionAllowed);

    getDefaultMediaTracks({ mic: microphonePermissionAllowed, webcam:cameraPermissionAllowed, firstTime:true});

    if (!microphonePermissionAllowed) {
      await requestAudioVideoPermission(Constants.permission.AUDIO);
    }

    if (!cameraPermissionAllowed) {
      await requestAudioVideoPermission(Constants.permission.VIDEO);
    }
  };

  const getCameraDevices = async () => {
    try {
      if (permissonAvaialble.current?.isCameraPermissionAllowed) {
        let webcams = await getCameras();
        setSelectedWebcamLabel(webcams[0]?.label);
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
        let speakers = await getPlaybackDevices();
        const hasMic = mics.length > 0;
        if (hasMic) {
          startMuteListener();
        }
        setSelectedSpeakerLabel(speakers[0]?.label);
        setSelectedSpeaker({ id: speakers[0]?.deviceId });
        setSelectedMicLabel(mics[0]?.label);
        setDevices((devices) => {
          return { ...devices, mics, speakers };
        });
      }
    } catch (err) {
      console.log("Error in getting audio devices", err);
    }
  };

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
                              onClick={_handleToggleMic}
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

                        <DropDown
                          isMicrophonePermissionAllowed={
                            isMicrophonePermissionAllowed
                          }
                          mics={mics}
                          changeMic={changeMic}
                          setSelectedMic={setSelectedMic}
                          selectedMicLabel={selectedMicLabel}
                          setSelectedMicLabel={setSelectedMicLabel}
                          audioStream={audioStream}
                          selectedSpeaker={selectedSpeaker}
                          audioTrack={audioTrack}
                          micOn={micOn}
                        />

                        <DropDownCam
                          isCameraPermissionAllowed={isCameraPermissionAllowed}
                          changeWebcam={changeWebcam}
                          webcams={webcams}
                          setSelectedWebcam={setSelectedWebcam}
                          selectedWebcamLabel={selectedWebcamLabel}
                          setSelectedWebcamLabel={setSelectedWebcamLabel}
                        />

                        <DropDownSpeaker
                          isMicrophonePermissionAllowed={
                            isMicrophonePermissionAllowed
                          }
                          speakers={speakers}
                          setSelectedSpeaker={setSelectedSpeaker}
                          selectedSpeakerLabel={selectedSpeakerLabel}
                          setSelectedSpeakerLabel={setSelectedSpeakerLabel}
                          selectedSpeaker={selectedSpeaker}
                        />
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
                      const valid = await validateMeeting({
                        roomId: id,
                        token,
                      });

                      if (valid) {
                        setToken(token);
                        setMeetingId(id);
                        if (videoTrack) {
                          videoTrack.stop();
                          setVideoTrack(null);
                        }
                        onClickStartMeeting();
                        setParticipantName("");
                      } else alert("Invalid Meeting Id");
                    }}
                    _handleOnCreateMeeting={async () => {
                      const token = await getToken();
                      const _meetingId = await createMeeting({ token });
                      setToken(token);
                      setMeetingId(_meetingId);
                      setParticipantName("");
                      return _meetingId;
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
