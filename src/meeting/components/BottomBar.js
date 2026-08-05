import {
  Constants,
  useMeeting,
  usePubSub,
  useMediaDevice,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import recordingBlink from "../../static/animations/recording-blink.json";
import useIsRecording from "../../hooks/useIsRecording";
import RecordingIcon from "../../icons/Bottombar/RecordingIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";
import MicOffIcon from "../../icons/Bottombar/MicOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import WebcamOffIcon from "../../icons/Bottombar/WebcamOffIcon";
import ScreenShareIcon from "../../icons/Bottombar/ScreenShareIcon";
import ChatIcon from "../../icons/Bottombar/ChatIcon";
import ParticipantsIcon from "../../icons/Bottombar/ParticipantsIcon";
import EndIcon from "../../icons/Bottombar/EndIcon";
import RaiseHandIcon from "../../icons/Bottombar/RaiseHandIcon";
import PipIcon from "../../icons/Bottombar/PipIcon";
import { OutlinedButton } from "../../components/buttons/OutlinedButton";
import useIsTab from "../../hooks/useIsTab";
import useIsMobile from "../../hooks/useIsMobile";
import { MobileIconButton } from "../../components/buttons/MobileIconButton";
import { sideBarModes } from "../../utils/common";
import { setRelaySinkId } from "../../utils/audioOutputRelay";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { createPopper } from "@popperjs/core";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import useMediaStream from "../../hooks/useMediaStream";

function PipBTN({ isMobile, isTab }) {
  const { pipMode, setPipMode } = useMeetingAppContext();

  const getRowCount = (length) => {
    return length > 2 ? 2 : length > 0 ? 1 : 0;
  };
  const getColCount = (length) => {
    return length < 2 ? 1 : length < 5 ? 2 : 3;
  };

  const canvasRef = useRef(null);
  const pipVideoRef = useRef(null);
  const rafRef = useRef(null);

  //PIP can be entered either with the standard API or, on Safari, with the
  //webkit presentation mode API, so both have to be taken in to account
  const isInPipMode = () => {
    const pipVideo = pipVideoRef.current;
    return (
      !!pipVideo &&
      (document.pictureInPictureElement === pipVideo ||
        pipVideo.webkitPresentationMode === "picture-in-picture")
    );
  };

  //These will draw all the video elements in to the Canvas
  const drawCanvas = () => {
    const source = canvasRef.current;
    const pipVideo = pipVideoRef.current;
    if (!source || !pipVideo) {
      return;
    }
    const ctx = source.getContext("2d");

    try {
      //Perform initial black paint on the canvas
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, source.width, source.height);

      //Getting all the video elements in the document, except the one we popout
      //for PIP (it stays in the DOM, so it has to be left out of the grid)
      const videos = Array.from(document.querySelectorAll("video")).filter(
        (video) => video !== pipVideo
      );

      //Drawing the participant videos on the canvas in the grid format
      const rows = getRowCount(videos.length);
      const columns = getColCount(videos.length);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          const video = videos[j + i * columns];
          if (video) {
            ctx.drawImage(
              video,
              j < 1 ? 0 : source.width / (columns / j),
              i < 1 ? 0 : source.height / (rows / i),
              source.width / columns,
              source.height / rows
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
    }

    //If pip mode is on, keep drawing the canvas when ever new frame is requested
    rafRef.current = isInPipMode() ? requestAnimationFrame(drawCanvas) : null;
  };

  const startDrawing = () => {
    //A loop is already running, nothing to do
    if (rafRef.current === null) {
      drawCanvas();
    }
  };

  const stopDrawing = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  //Safari only allows requestPictureInPicture() to be called synchronously from a
  //user gesture. Waiting for play() or loadedmetadata inside the click handler
  //consumes that activation and fails with "The request is not triggered by a user
  //activation.", so the canvas and the video are prepared upfront here and the
  //click handler only has to make the PIP call itself.
  useEffect(() => {
    if (!("pictureInPictureEnabled" in document) && !("webkitSetPresentationMode" in HTMLVideoElement.prototype)) {
      return;
    }

    //Creating a Canvas which will render our PIP Stream
    const source = document.createElement("canvas");
    source.width = 640;
    source.height = 360;
    canvasRef.current = source;

    //Create a Video tag which we will popout for PIP
    const pipVideo = document.createElement("video");
    pipVideo.autoplay = true;
    pipVideo.playsInline = true;
    //Muted is required for the video to start playing without a user gesture
    pipVideo.muted = true;
    //Safari refuses to popout a detached element and stops playback on
    //display:none, so it is kept in the DOM but out of sight
    pipVideo.style.cssText =
      "position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(pipVideo);
    pipVideoRef.current = pipVideo;

    //Paint a first frame so that the captured stream has a track with dimensions
    drawCanvas();

    //Creating stream from canvas which we will play
    pipVideo.srcObject = source.captureStream();

    //When the PIP mode starts, we will start drawing canvas with PIP view
    const onEnterPip = () => {
      setPipMode(true);
      startDrawing();
    };

    //When PIP mode exits, we will stop drawing the canvas
    const onLeavePip = () => {
      setPipMode(false);
      stopDrawing();
    };

    const onPresentationModeChanged = () => {
      if (pipVideo.webkitPresentationMode === "picture-in-picture") {
        onEnterPip();
      } else {
        onLeavePip();
      }
    };

    pipVideo.addEventListener("enterpictureinpicture", onEnterPip);
    pipVideo.addEventListener("leavepictureinpicture", onLeavePip);
    pipVideo.addEventListener(
      "webkitpresentationmodechanged",
      onPresentationModeChanged
    );

    const playPromise = pipVideo.play();
    if (playPromise) {
      playPromise.catch((error) => console.log(error));
    }

    return () => {
      stopDrawing();
      pipVideo.removeEventListener("enterpictureinpicture", onEnterPip);
      pipVideo.removeEventListener("leavepictureinpicture", onLeavePip);
      pipVideo.removeEventListener(
        "webkitpresentationmodechanged",
        onPresentationModeChanged
      );
      if (document.pictureInPictureElement === pipVideo) {
        document.exitPictureInPicture().catch((error) => console.log(error));
      }
      //Dispose the track we created earlier
      if (pipVideo.srcObject) {
        pipVideo.srcObject.getTracks().forEach((track) => track.stop());
        pipVideo.srcObject = null;
      }
      pipVideo.remove();
      pipVideoRef.current = null;
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //This has to stay synchronous, do not make it async or await anything before
  //the requestPictureInPicture() call, Safari will reject it otherwise
  const togglePipMode = () => {
    const pipVideo = pipVideoRef.current;

    //Check if browser supports PIP mode else show a message to user
    if (!pipVideo) {
      alert("PIP is not supported by your browser");
      return;
    }

    //Check if PIP Window is active or not
    //If active we will turn it off
    if (isInPipMode()) {
      if (document.pictureInPictureElement === pipVideo) {
        document.exitPictureInPicture().catch((error) => console.log(error));
      } else {
        pipVideo.webkitSetPresentationMode("inline");
      }
      return;
    }

    //Refresh the canvas so the popped out window does not start on a stale frame
    drawCanvas();
    //Safari pauses the element in the background, playback is needed for PIP
    const playPromise = pipVideo.play();
    if (playPromise) {
      playPromise.catch((error) => console.log(error));
    }

    if (document.pictureInPictureEnabled) {
      pipVideo.requestPictureInPicture().catch((error) => console.log(error));
    } else if (
      pipVideo.webkitSupportsPresentationMode &&
      pipVideo.webkitSupportsPresentationMode("picture-in-picture")
    ) {
      //Safari on iPadOS and older Safari versions only expose the webkit API
      pipVideo.webkitSetPresentationMode("picture-in-picture");
    } else {
      alert("PIP is not supported by your browser");
    }
  };

  return isMobile || isTab ? (
    <MobileIconButton
      id="pip-btn"
      tooltipTitle={pipMode ? "Stop PiP" : "Start Pip"}
      buttonText={pipMode ? "Stop PiP" : "Start Pip"}
      isFocused={pipMode}
      Icon={PipIcon}
      onClick={() => {
        togglePipMode();
      }}
      disabled={false}
    />
  ) : (
    <OutlinedButton
      Icon={PipIcon}
      onClick={() => {
        togglePipMode();
      }}
      isFocused={pipMode}
      tooltip={pipMode ? "Stop PiP" : "Start Pip"}
      disabled={false}
    />
  );
}

const MicBTN = () => {
  const {
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker,
    isMicrophonePermissionAllowed,
  } = useMeetingAppContext();

  const { getMicrophones, getPlaybackDevices } = useMediaDevice({
    onDeviceChanged(devices) {
      getMics();
      const newSpeakerList = devices.devices.filter(device => device.kind === 'audiooutput');

      if (newSpeakerList.length > 0) {
        setSelectedSpeaker({ id: newSpeakerList[0].deviceId, label: newSpeakerList[0].label });
      }
    }
  });

  const { localMicOn, changeMic, toggleMic } = useMeeting();
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);

  const getMics = async () => {
    const mics = await getMicrophones();
    const speakers = await getPlaybackDevices();

    mics && mics?.length && setMics(mics);
    speakers && speakers?.length && setSpeakers(speakers);
  };

  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef();
  const tooltipRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: "top",
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  return (
    <>
      <OutlinedButton
        Icon={localMicOn ? MicOnIcon : MicOffIcon}
        onClick={() => {
          toggleMic();
        }}
        bgColor={localMicOn ? "bg-gray-750" : "bg-white"}
        borderColor={localMicOn && "#ffffff33"}
        isFocused={localMicOn}
        focusIconColor={localMicOn && "white"}
        tooltip={"Toggle Mic"}
        renderRightComponent={() => {
          return (
            <>
              <Popover className="relative">
                {({ close }) => (
                  <>
                    <Popover.Button
                      disabled={!isMicrophonePermissionAllowed}
                      onClick={() => {
                        getMics();
                      }}
                      className="flex items-center justify-center mt-1 mr-1 focus:outline-none"
                    >
                      <div
                        ref={btnRef}
                        onMouseEnter={openTooltip}
                        onMouseLeave={closeTooltip}
                      >
                        <ChevronDownIcon
                          className="h-4 w-4"
                          style={{
                            color: localMicOn ? "white" : "black",
                          }}
                        />
                      </div>
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-1/2 bottom-full z-10 mt-3 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className={" bg-gray-750 py-1"}>
                            <div>
                              <div className="flex items-center p-3 pb-0">
                                <p className="ml-3 text-sm text-gray-900">
                                  {"MICROPHONE"}
                                </p>
                              </div>
                              <div className="flex flex-col">
                                {mics.map(({ deviceId, label }, index) => (
                                  <div
                                    className={`px-3 py-1 my-1 pl-6 text-white text-left ${deviceId === selectedMic.id &&
                                      "bg-gray-150"
                                      }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left ${deviceId === selectedMic.id &&
                                        "bg-gray-150"
                                        }`}
                                      key={`mics_${deviceId}`}
                                      onClick={() => {
                                        setSelectedMic({ id: deviceId });
                                        changeMic(deviceId);
                                        close();
                                      }}
                                    >
                                      {label || `Mic ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <hr className="border border-gray-50 mt-2 mb-1" />
                            <div>
                              <div className="flex p-3 pb-0">
                                <p className="ml-3 text-sm text-gray-900  text-center">
                                  {"SPEAKER"}
                                </p>
                              </div>
                              <div className="flex flex-col ">
                                {speakers.map(({ deviceId, label }, index) => (
                                  <div
                                    className={`px-3 py-1 my-1 pl-6 text-white ${deviceId === selectedSpeaker.id &&
                                      "bg-gray-150"
                                      }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left ${deviceId === selectedSpeaker.id &&
                                        "bg-gray-150"
                                        }`}
                                      key={`speakers_${deviceId}`}
                                      onClick={() => {
                                        setSelectedSpeaker({ id: deviceId });
                                        setRelaySinkId(deviceId);
                                        close();
                                      }}
                                    >
                                      {label || `Speaker ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <div
                style={{ zIndex: 999 }}
                className={`${tooltipShow ? "" : "hidden"
                  } overflow-hidden flex flex-col items-center justify-center pb-4`}
                ref={tooltipRef}
              >
                <div className={"rounded-md p-1.5 bg-black "}>
                  <p className="text-base text-white ">{"Change microphone"}</p>
                </div>
              </div>
            </>
          );
        }}
      />
    </>
  );
};

const WebCamBTN = () => {
  const { selectedWebcam, setSelectedWebcam, isCameraPermissionAllowed } =
    useMeetingAppContext();

  const { getCameras } = useMediaDevice();
  const { localWebcamOn, changeWebcam, toggleWebcam } = useMeeting();
  const [webcams, setWebcams] = useState([]);
  const { getVideoTrack } = useMediaStream();

  const getWebcams = async () => {
    let webcams = await getCameras();
    webcams && webcams?.length && setWebcams(webcams);
  };

  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef();
  const tooltipRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: "top",
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  return (
    <>
      <OutlinedButton
        Icon={localWebcamOn ? WebcamOnIcon : WebcamOffIcon}
        onClick={async () => {
          let track;
          if (!localWebcamOn) {
            track = await getVideoTrack({
              webcamId: selectedWebcam.id,
            });
          }
          toggleWebcam(track);
        }}
        bgColor={localWebcamOn ? "bg-gray-750" : "bg-white"}
        borderColor={localWebcamOn && "#ffffff33"}
        isFocused={localWebcamOn}
        focusIconColor={localWebcamOn && "white"}
        tooltip={"Toggle Webcam"}
        renderRightComponent={() => {
          return (
            <>
              <Popover className="relative">
                {({ close }) => (
                  <>
                    <Popover.Button
                      disabled={!isCameraPermissionAllowed}
                      onClick={() => {
                        getWebcams();
                      }}
                      className="flex items-center justify-center mt-1 mr-1 focus:outline-none"
                    >
                      <div
                        ref={btnRef}
                        onMouseEnter={openTooltip}
                        onMouseLeave={closeTooltip}
                      >
                        <ChevronDownIcon
                          className="h-4 w-4"
                          style={{
                            color: localWebcamOn ? "white" : "black",
                          }}
                        />
                      </div>
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-1/2 bottom-full z-10 mt-3 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className={" bg-gray-750 py-1"}>
                            <div>
                              <div className="flex items-center p-3 pb-0">
                                <p className="ml-3 text-sm text-gray-900">
                                  {"WEBCAM"}
                                </p>
                              </div>
                              <div className="flex flex-col">
                                {webcams.map(({ deviceId, label }, index) => (
                                  <div
                                    className={`px-3 py-1 my-1 pl-6 text-white ${deviceId === selectedWebcam.id &&
                                      "bg-gray-150"
                                      }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left ${deviceId === selectedWebcam.id &&
                                        "bg-gray-150"
                                        }`}
                                      key={`output_webcams_${deviceId}`}
                                      onClick={() => {
                                        setSelectedWebcam({ id: deviceId });
                                        changeWebcam(deviceId);
                                        close();
                                      }}
                                    >
                                      {label || `Webcam ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <div
                style={{ zIndex: 999 }}
                className={`${tooltipShow ? "" : "hidden"
                  } overflow-hidden flex flex-col items-center justify-center pb-4`}
                ref={tooltipRef}
              >
                <div className={"rounded-md p-1.5 bg-black "}>
                  <p className="text-base text-white ">{"Change webcam"}</p>
                </div>
              </div>
            </>
          );
        }}
      />
    </>
  );
};

const RaiseHandBTN = ({ isMobile, isTab }) => {
  const { publish } = usePubSub("RAISE_HAND");
  const RaiseHand = () => {
    try {
      publish("Raise Hand");
    } catch (e) {
      console.log("Error in pubsub", e)
    }
  };

  return isMobile || isTab ? (
    <MobileIconButton
      id="RaiseHandBTN"
      tooltipTitle={"Raise hand"}
      Icon={RaiseHandIcon}
      onClick={RaiseHand}
      buttonText={"Raise Hand"}
    />
  ) : (
    <OutlinedButton
      onClick={RaiseHand}
      tooltip={"Raise Hand"}
      Icon={RaiseHandIcon}
    />
  );
};

const RecordingBTN = () => {
  const { startRecording, stopRecording, recordingState } = useMeeting();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: recordingBlink,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
    height: 64,
    width: 160,
  };

  const isRecording = useIsRecording();
  const isRecordingRef = useRef(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const { isRequestProcessing } = useMemo(
    () => ({
      isRequestProcessing:
        recordingState === Constants.recordingEvents.RECORDING_STARTING ||
        recordingState === Constants.recordingEvents.RECORDING_STOPPING,
    }),
    [recordingState]
  );

  const _handleClick = () => {
    const isRecording = isRecordingRef.current;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <OutlinedButton
      Icon={RecordingIcon}
      onClick={_handleClick}
      isFocused={isRecording}
      tooltip={
        recordingState === Constants.recordingEvents.RECORDING_STARTED
          ? "Stop Recording"
          : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
              ? "Start Recording"
              : recordingState === Constants.recordingEvents.RECORDING_STOPPING
                ? "Stopping Recording"
                : "Start Recording"
      }
      lottieOption={isRecording ? defaultOptions : null}
      isRequestProcessing={isRequestProcessing}
    />
  );
};

const ScreenShareBTN = ({ isMobile, isTab }) => {
  const { localScreenShareOn, toggleScreenShare, presenterId } = useMeeting();

  return isMobile || isTab ? (
    <MobileIconButton
      id="screen-share-btn"
      tooltipTitle={
        presenterId
          ? localScreenShareOn
            ? "Stop Presenting"
            : null
          : "Present Screen"
      }
      buttonText={
        presenterId
          ? localScreenShareOn
            ? "Stop Presenting"
            : null
          : "Present Screen"
      }
      isFocused={localScreenShareOn}
      Icon={ScreenShareIcon}
      onClick={() => {
        toggleScreenShare();
      }}
      disabled={
        presenterId
          ? localScreenShareOn
            ? false
            : true
          : isMobile
            ? true
            : false
      }
    />
  ) : (
    <OutlinedButton
      Icon={ScreenShareIcon}
      onClick={() => {
        toggleScreenShare();
      }}
      isFocused={localScreenShareOn}
      tooltip={
        presenterId
          ? localScreenShareOn
            ? "Stop Presenting"
            : null
          : "Present Screen"
      }
      disabled={presenterId ? (localScreenShareOn ? false : true) : false}
    />
  );
};

const LeaveBTN = ({ setIsMeetingLeft }) => {
  const { leave } = useMeeting();

  return (
    <OutlinedButton
      Icon={EndIcon}
      bgColor="bg-red-150"
      onClick={() => {
        leave();
        setIsMeetingLeft(true);
      }}
      tooltip="Leave Meeting"
    />
  );
};

const ChatBTN = ({ isMobile, isTab }) => {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();

  return isMobile || isTab ? (
    <MobileIconButton
      tooltipTitle={"Chat"}
      buttonText={"Chat"}
      Icon={ChatIcon}
      isFocused={sideBarMode === sideBarModes.CHAT}
      onClick={() => {
        setSideBarMode((s) =>
          s === sideBarModes.CHAT ? null : sideBarModes.CHAT
        );
      }}
    />
  ) : (
    <OutlinedButton
      Icon={ChatIcon}
      onClick={() => {
        setSideBarMode((s) =>
          s === sideBarModes.CHAT ? null : sideBarModes.CHAT
        );
      }}
      isFocused={sideBarMode === "CHAT"}
      tooltip="View Chat"
    />
  );
};

const ParticipantsBTN = ({ isMobile, isTab }) => {
  const { participants } = useMeeting();
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();

  return isMobile || isTab ? (
    <MobileIconButton
      tooltipTitle={"Participants"}
      isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
      buttonText={"Participants"}
      disabledOpacity={1}
      Icon={ParticipantsIcon}
      onClick={() => {
        setSideBarMode((s) =>
          s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
        );
      }}
      badge={`${new Map(participants)?.size}`}
    />
  ) : (
    <OutlinedButton
      Icon={ParticipantsIcon}
      onClick={() => {
        setSideBarMode((s) =>
          s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
        );
      }}
      isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
      tooltip={"View \nParticipants"}
      badge={`${new Map(participants)?.size}`}
    />
  );
};

const MeetingIdCopyBTN = () => {
  const { meetingId } = useMeeting();
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className="flex items-center justify-center lg:ml-0 ml-4 mt-4 xl:mt-0">
      <div className="flex border-2 border-gray-850 p-2 rounded-md items-center justify-center">
        <h1 className="text-white text-base ">{meetingId}</h1>
        <button
          className="ml-2"
          onClick={() => {
            navigator.clipboard.writeText(meetingId);
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 3000);
          }}
        >
          {isCopied ? (
            <CheckIcon className="h-5 w-5 text-green-400" />
          ) : (
            <ClipboardIcon className="h-5 w-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export function BottomBar({ bottomBarHeight, setIsMeetingLeft }) {
  const tollTipEl = useRef();
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const [open, setOpen] = useState(false);

  const handleClickFAB = () => {
    setOpen(true);
  };

  const handleCloseFAB = () => {
    setOpen(false);
  };

  const BottomBarButtonTypes = useMemo(
    () => ({
      END_CALL: "END_CALL",
      CHAT: "CHAT",
      PARTICIPANTS: "PARTICIPANTS",
      SCREEN_SHARE: "SCREEN_SHARE",
      WEBCAM: "WEBCAM",
      MIC: "MIC",
      RAISE_HAND: "RAISE_HAND",
      RECORDING: "RECORDING",
      PIP: "PIP",
      MEETING_ID_COPY: "MEETING_ID_COPY",
    }),
    []
  );

  const otherFeatures = [
    { icon: BottomBarButtonTypes.RAISE_HAND },
    { icon: BottomBarButtonTypes.PIP },
    { icon: BottomBarButtonTypes.SCREEN_SHARE },
    { icon: BottomBarButtonTypes.CHAT },
    { icon: BottomBarButtonTypes.PARTICIPANTS },
    { icon: BottomBarButtonTypes.MEETING_ID_COPY },
  ];

  return isMobile || isTab ? (
    <div
      className="flex items-center justify-center"
      style={{ height: bottomBarHeight }}
    >
      <LeaveBTN setIsMeetingLeft={setIsMeetingLeft} />
      <MicBTN />
      <WebCamBTN />
      <RecordingBTN />
      <OutlinedButton Icon={EllipsisHorizontalIcon} onClick={handleClickFAB} />
      <Transition appear show={Boolean(open)} as={Fragment}>
        <Dialog
          as="div"
          className="relative"
          style={{ zIndex: 9999 }}
          onClose={handleCloseFAB}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="translate-y-full opacity-0 scale-95"
          >
            <div className="fixed inset-0 overflow-y-hidden">
              <div className="flex h-full items-end justify-end text-center">
                <Dialog.Panel className="w-screen transform overflow-hidden bg-gray-800 shadow-xl transition-all">
                  <div className="grid container bg-gray-800 py-6">
                    <div className="grid grid-cols-12 gap-2">
                      {otherFeatures.map(({ icon }) => {
                        return (
                          <div
                            className={`grid items-center justify-center ${icon === BottomBarButtonTypes.MEETING_ID_COPY
                                ? "col-span-7 sm:col-span-5 md:col-span-3"
                                : "col-span-4 sm:col-span-3 md:col-span-2"
                              }`}
                          >
                            {icon === BottomBarButtonTypes.RAISE_HAND ? (
                              <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.SCREEN_SHARE ? (
                              <ScreenShareBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon === BottomBarButtonTypes.CHAT ? (
                              <ChatBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.PARTICIPANTS ? (
                              <ParticipantsBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon ===
                              BottomBarButtonTypes.MEETING_ID_COPY ? (
                              <MeetingIdCopyBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon === BottomBarButtonTypes.PIP ? (
                              <PipBTN isMobile={isMobile} isTab={isTab} />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  ) : (
    <div className="md:flex lg:px-2 xl:px-6 pb-2 px-2 hidden">
      <MeetingIdCopyBTN />

      <div className="flex flex-1 items-center justify-center" ref={tollTipEl}>
        <RecordingBTN />
        <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
        <MicBTN />
        <WebCamBTN />
        <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
        <PipBTN isMobile={isMobile} isTab={isTab} />
        <LeaveBTN setIsMeetingLeft={setIsMeetingLeft} />
      </div>
      <div className="flex items-center justify-center">
        <ChatBTN isMobile={isMobile} isTab={isTab} />
        <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
      </div>
    </div>
  );
}
