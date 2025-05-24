import { Constants, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@heroicons/react/outline";
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

  const pipWindowRef = useRef(null);
  const togglePipMode = async () => {
    //Check if PIP Window is active or not
    //If active we will turn it off
    if (pipWindowRef.current) {
      await document.exitPictureInPicture();
      pipWindowRef.current = null;
      return;
    }

    //Check if browser supports PIP mode else show a message to user
    if ("pictureInPictureEnabled" in document) {
      //Creating a Canvas which will render our PIP Stream
      const source = document.createElement("canvas");
      const ctx = source.getContext("2d");

      //Create a Video tag which we will popout for PIP
      const pipVideo = document.createElement("video");
      pipWindowRef.current = pipVideo;
      pipVideo.autoplay = true;

      //Creating stream from canvas which we will play
      const stream = source.captureStream();
      pipVideo.srcObject = stream;
      drawCanvas();

      //When Video is ready we will start PIP mode
      pipVideo.onloadedmetadata = () => {
        pipVideo.requestPictureInPicture();
      };
      await pipVideo.play();

      //When the PIP mode starts, we will start drawing canvas with PIP view
      pipVideo.addEventListener("enterpictureinpicture", (event) => {
        drawCanvas();
        setPipMode(true);
      });

      //When PIP mode exits, we will dispose the track we created earlier
      pipVideo.addEventListener("leavepictureinpicture", (event) => {
        pipWindowRef.current = null;
        setPipMode(false);
        pipVideo.srcObject.getTracks().forEach((track) => track.stop());
      });

      //These will draw all the video elements in to the Canvas
      function drawCanvas() {
        //Getting all the video elements in the document
        const videos = document.querySelectorAll("video");
        try {
          //Perform initial black paint on the canvas
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, source.width, source.height);

          //Drawing the participant videos on the canvas in the grid format
          const rows = getRowCount(videos.length);
          const columns = getColCount(videos.length);
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              if (j + i * columns <= videos.length || videos.length == 1) {
                ctx.drawImage(
                  videos[j + i * columns],
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
        if (document.pictureInPictureElement === pipVideo) {
          requestAnimationFrame(drawCanvas);
        }
      }
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
      label={pipMode ? "Stop PiP" : "Start Pip"} // Assuming OutlinedButton supports a 'label' prop
      onClick={() => {
        togglePipMode();
      }}
      isFocused={pipMode} // Use this for styling if active
      tooltip={pipMode ? "Stop PiP" : "Start Pip"}
      disabled={false}
      // Styling for list item appearance
      buttonClassName="w-full flex items-center justify-start p-2 rounded-md text-white space-x-3"
      bgColor={pipMode ? "bg-gray-500" : "bg-transparent"} // Slightly different background if active
      hoverBgColor="hover:bg-gray-600"
      textClassName="text-sm font-normal"
      focusIconColor="white" // Keep icon white
    />
  );
}

export function BottomBar({
  bottomBarHeight,
  setIsMeetingLeft,
  selectWebcamDeviceId,
  setSelectWebcamDeviceId,
  selectMicDeviceId,
  setSelectMicDeviceId,
}) {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();

  // Define isMobile and isTab once here for use throughout BottomBar
  const isMobile = useIsMobile();
  const isTab = useIsTab();

  const RaiseHandBTN = ({ isMobile, isTab }) => {
    const { publish } = usePubSub("RAISE_HAND");
    const RaiseHand = () => {
      publish("Raise Hand");
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
        label={"Raise Hand"} // Assuming OutlinedButton supports a 'label' prop
        Icon={RaiseHandIcon}
        // Styling for list item appearance
        buttonClassName="w-full flex items-center justify-start p-2 rounded-md text-white space-x-3"
        bgColor="bg-transparent"
        hoverBgColor="hover:bg-gray-600"
        textClassName="text-sm font-normal"
        focusIconColor="white" // Keep icon white
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

    const buttonText =
      recordingState === Constants.recordingEvents.RECORDING_STARTED
        ? "Stop Recording"
        : recordingState === Constants.recordingEvents.RECORDING_STARTING
        ? "Starting Recording"
        : recordingState === Constants.recordingEvents.RECORDING_STOPPED
        ? "Start Recording"
        : recordingState === Constants.recordingEvents.RECORDING_STOPPING
        ? "Stopping Recording"
        : "Start Recording";
    
    // Determine if the recording is in an "active" state for styling
    const isActive = recordingState === Constants.recordingEvents.RECORDING_STARTED || 
                     recordingState === Constants.recordingEvents.RECORDING_STARTING;

    return (
      <OutlinedButton
        Icon={RecordingIcon}
        label={buttonText} // Assuming OutlinedButton supports a 'label' prop for visible text
        onClick={_handleClick}
        isFocused={isActive} // Use 'isActive' for styling focus/active state
        tooltip={buttonText} // Tooltip remains for accessibility on hover (if label is not visible enough)
        lottieOption={isRecording ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
        // Styling for list item appearance in "More Options" menu
        buttonClassName="w-full flex items-center justify-start p-2 rounded-md text-white space-x-3"
        bgColor={isActive ? "bg-gray-500" : "bg-transparent"} // Different background if active
        hoverBgColor="hover:bg-gray-600" // Hover effect
        textClassName="text-sm font-normal" // Styling for the label text
        focusIconColor="white" // Keep icon white
      />
    );
  };

  const MicBTN = () => {
    const mMeeting = useMeeting();
    const [mics, setMics] = useState([]);
    const localMicOn = mMeeting?.localMicOn;
    const changeMic = mMeeting?.changeMic;

    const getMics = async (mGetMics) => {
      const mics = await mGetMics();

      mics && mics?.length && setMics(mics);
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
            mMeeting.toggleMic();
          }}
          bgColor={localMicOn ? "bg-blue-500" : "bg-gray-700"}
          hoverBgColor={localMicOn ? "hover:bg-blue-600" : "hover:bg-gray-600"} // Added hover
          borderColor={localMicOn ? "border-blue-500" : "border-gray-700"}
          isFocused={localMicOn}
          focusIconColor={"white"}
          tooltip={"Toggle Mic"}
          buttonClassName="rounded-lg"
          renderRightComponent={() => {
            return (
              <>
                <Popover className="relative">
                  {({ close }) => (
                    <>
                      <Popover.Button className="flex items-center justify-center mt-1 mr-1">
                        <div
                          ref={btnRef}
                          onMouseEnter={openTooltip}
                          onMouseLeave={closeTooltip}
                        >
                          <button
                            onClick={(e) => {
                              getMics(mMeeting.getMics);
                            }}
                          >
                            <ChevronDownIcon
                              className="h-4 w-4"
                              style={{
                                color: mMeeting.localMicOn ? "white" : "black",
                              }}
                            />
                          </button>
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
                                      className={`px-3 py-1 my-1 pl-6 text-white text-left ${
                                        deviceId === selectMicDeviceId &&
                                        "bg-gray-150"
                                      }`}
                                    >
                                      <button
                                        className={`flex flex-1 w-full ${
                                          deviceId === selectMicDeviceId &&
                                          "bg-gray-150"
                                        }`}
                                        key={`mics_${deviceId}`}
                                        onClick={() => {
                                          setSelectMicDeviceId(deviceId);
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
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
                <div
                  style={{ zIndex: 999 }}
                  className={`${
                    tooltipShow ? "" : "hidden"
                  } overflow-hidden flex flex-col items-center justify-center pb-4`}
                  ref={tooltipRef}
                >
                  <div className={"rounded-md p-1.5 bg-black "}>
                    <p className="text-base text-white ">
                      {"Change microphone"}
                    </p>
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
    const mMeeting = useMeeting();
    const { selectWebcamDeviceId } = useMeetingAppContext();

    const [webcams, setWebcams] = useState([]);
    const { getVideoTrack } = useMediaStream();

    const localWebcamOn = mMeeting?.localWebcamOn;
    const disableWebcam = mMeeting?.disableWebcam;
    const changeWebcam = mMeeting?.changeWebcam;

    const getWebcams = async (mGetWebcams) => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const webcams = devices.filter(
        (d) =>
          d.kind === "videoinput" &&
          d.deviceId !== "default" &&
          d.deviceId !== "communications"
      );

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
                webcamId: selectWebcamDeviceId,
                encoderConfig: "h540p_w960p",
              });
            }
            mMeeting.toggleWebcam(track);
          }}
          bgColor={localWebcamOn ? "bg-blue-500" : "bg-gray-700"}
          hoverBgColor={localWebcamOn ? "hover:bg-blue-600" : "hover:bg-gray-600"} // Added hover
          borderColor={localWebcamOn ? "border-blue-500" : "border-gray-700"}
          isFocused={localWebcamOn}
          focusIconColor={"white"}
          tooltip={"Toggle Webcam"}
          buttonClassName="rounded-lg"
          renderRightComponent={() => {
            return (
              <>
                <Popover className="relative">
                  {({ close }) => (
                    <>
                      <Popover.Button className="flex items-center justify-center mt-1 mr-1">
                        <div
                          ref={btnRef}
                          onMouseEnter={openTooltip}
                          onMouseLeave={closeTooltip}
                        >
                          <button
                            onClick={(e) => {
                              getWebcams(mMeeting?.getWebcams);
                            }}
                          >
                            <ChevronDownIcon
                              className="h-4 w-4"
                              style={{
                                color: localWebcamOn ? "white" : "black",
                              }}
                            />
                          </button>
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
                                      className={`px-3 py-1 my-1 pl-6 text-white text-left ${
                                        deviceId === selectWebcamDeviceId &&
                                        "bg-gray-150"
                                      }`}
                                    >
                                      <button
                                        className={`flex flex-1 w-full ${
                                          deviceId === selectWebcamDeviceId &&
                                          "bg-gray-150"
                                        }`}
                                        key={`output_webcams_${deviceId}`}
                                        onClick={async () => {
                                          setSelectWebcamDeviceId(deviceId);
                                          await disableWebcam();
                                          let customTrack = await getVideoTrack(
                                            {
                                              webcamId: deviceId,
                                              encoderConfig: "h540p_w960p",
                                            }
                                          );

                                          changeWebcam(customTrack);
                                          setTimeout(() => {
                                            close();
                                          }, 200);
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
                  className={`${
                    tooltipShow ? "" : "hidden"
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
        bgColor={localScreenShareOn ? "bg-blue-500" : "bg-gray-700"}
        hoverBgColor={localScreenShareOn ? "hover:bg-blue-600" : "hover:bg-gray-600"} // Added hover
        borderColor={localScreenShareOn ? "border-blue-500" : "border-gray-700"}
        focusIconColor={"white"}
        tooltip={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        disabled={presenterId ? (localScreenShareOn ? false : true) : false}
        buttonClassName="rounded-lg"
      />
    );
  };

  const LeaveBTN = () => {
    const { leave } = useMeeting();

    return (
      <OutlinedButton
        Icon={EndIcon}
        bgColor="bg-red-500" // This was corrected in Phase 1, ensuring it's still bg-red-500
        hoverBgColor="hover:bg-red-600" // Added hover state
        onClick={() => {
          leave();
          setIsMeetingLeft(true);
        }}
        tooltip="Leave Meeting"
        buttonClassName="rounded-lg text-white" // Ensure text/icon is white
        focusIconColor="white" // Ensure icon is white
      />
    );
  };

  const ChatBTN = ({ isMobile, isTab }) => {
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
      bgColor={sideBarMode === "CHAT" ? "bg-gray-600" : "bg-gray-700"} // Active state like MoreOptions
      hoverBgColor={sideBarMode === "CHAT" ? "" : "hover:bg-gray-600"}
      buttonClassName="rounded-lg"
      focusIconColor="white"
      />
    );
  };

  const ParticipantsBTN = ({ isMobile, isTab }) => {
    const { participants } = useMeeting();
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
        tooltip={"View Participants"}
        badge={`${new Map(participants)?.size}`}
      bgColor={sideBarMode === sideBarModes.PARTICIPANTS ? "bg-gray-600" : "bg-gray-700"} // Active state like MoreOptions
      hoverBgColor={sideBarMode === sideBarModes.PARTICIPANTS ? "" : "hover:bg-gray-600"}
      buttonClassName="rounded-lg"
      focusIconColor="white"
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

  // isMobile and isTab are already defined above, no need to redefine here.
  const MoreOptionsBTN = () => {
    return (
      <Popover className="relative">
        {({ open }) => ( // Destructure open state here
          <>
            <Popover.Button as={Fragment}>
              <OutlinedButton
                Icon={DotsHorizontalIcon}
                tooltip="More Options"
                // Apply bg-gray-600 if open, otherwise bg-gray-700. Keep hover:bg-gray-600 for inactive state.
                bgColor={open ? "bg-gray-600" : "bg-gray-700"}
                hoverBgColor={open ? "" : "hover:bg-gray-600"} // No separate hover if already "active"
                buttonClassName="rounded-lg"
                focusIconColor="white" // Icon is always white
              />
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
              {/* Adjusted Popover.Panel styling: specific width, padding, rounded-lg */}
              <Popover.Panel className="absolute bottom-full left-1/2 z-10 mb-2 w-60 -translate-x-1/2 transform sm:px-0">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid bg-gray-700 p-3 space-y-1"> {/* Increased padding to p-3 */}
                    <RecordingBTN />
                    <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
                    <PipBTN isMobile={isMobile} isTab={isTab} />
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const tollTipEl = useRef();
  const [open, setOpen] = useState(false);
  // Cleaned up comments and redundant declarations

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
      <LeaveBTN />
      <MicBTN />
      <WebCamBTN />
      <RecordingBTN />
      <OutlinedButton Icon={DotsHorizontalIcon} onClick={handleClickFAB} />
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
                            className={`grid items-center justify-center ${
                              icon === BottomBarButtonTypes.MEETING_ID_COPY
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
    <div className="md:flex lg:px-2 xl:px-6 pb-2 px-2 hidden bg-gray-800 items-center">
      {/* Left side */}
      <MeetingIdCopyBTN />

      {/* Center buttons */}
      <div className="flex flex-1 items-center justify-center space-x-2" ref={tollTipEl}> {/* Added space-x-2 */}
        <MicBTN />
        <WebCamBTN />
        <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
        <MoreOptionsBTN />
        <LeaveBTN />
      </div>

      {/* Right side */}
      <div className="flex items-center justify-center space-x-2"> {/* Added space-x-2 */}
        <ChatBTN isMobile={isMobile} isTab={isTab} />
        <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
      </div>
    </div>
  );
}
