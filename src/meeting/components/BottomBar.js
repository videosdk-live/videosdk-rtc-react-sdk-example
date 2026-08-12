import {
  Constants,
  useMeeting,
  useParticipant,
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
import { toast } from "react-toastify";

const pipToastOptions = {
  position: "bottom-left",
  autoClose: 4000,
  hideProgressBar: true,
  closeButton: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

// Which PiP pipeline the button uses:
// "single" — local webcam via a direct track (most robust in background)
// "multi"  — canvas grid of all participants (custom PiP UI)
const PIP_STRATEGY = "multi";

const getPipSupport = () => ({
  standard: "pictureInPictureEnabled" in document,
  webkit:
    typeof HTMLVideoElement !== "undefined" &&
    typeof HTMLVideoElement.prototype.webkitSetPresentationMode === "function",
});

function PipBTN({ isMobile, isTab }) {
  const { pipMode, setPipMode } = useMeetingAppContext();
  const { localParticipant } = useMeeting({
    onMeetingLeft: () => {
      exitSinglePip();
      exitMultiPip();
    },
  });
  const { webcamStream, webcamOn } = useParticipant(
    localParticipant?.id || ""
  );

  const pipVideoRef = useRef(null);
  const clonedTrackRef = useRef(null);
  const pipMultiWindowRef = useRef(null);
  const pipMultiCleanupRef = useRef(null);

  // Exit single-PiP if active (the helper element itself stays alive).
  const exitSinglePip = () => {
    const video = pipVideoRef.current;
    if (!video) return;
    try {
      if (video.webkitPresentationMode === "picture-in-picture") {
        video.webkitSetPresentationMode("inline");
      }
      if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture().catch(() => {});
      }
    } catch (e) {
      console.log("[PiP] exit failed", e);
    }
  };

  // Close multi-PiP and force teardown — needed on meeting-left/unmount
  // since its video lives on document.body, outside React.
  const exitMultiPip = () => {
    const active = pipMultiWindowRef.current;
    if (!active) return;
    try {
      if (active.webkitPresentationMode === "picture-in-picture") {
        active.webkitSetPresentationMode("inline");
      }
      if (document.pictureInPictureElement === active) {
        document.exitPictureInPicture().catch(() => {});
      }
    } catch (e) {
      console.log("[PiP-Multi] exit failed", e);
    }
    // Leave events don't fire if entry was still in flight; cleanup() is idempotent.
    if (pipMultiCleanupRef.current) pipMultiCleanupRef.current();
  };

  const getRowCount = (length) => (length > 2 ? 2 : length > 0 ? 1 : 0);
  const getColCount = (length) => (length < 2 ? 1 : length < 5 ? 2 : 3);

  // iOS browsers are all WebKit and only expose webkitSetPresentationMode.
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iP(hone|ad|od)/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  const isSafari =
    typeof navigator !== "undefined" &&
    (/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent) ||
      isIOS);

  useEffect(() => {
    // The helper video (and its webcam clone) only serve single-PiP —
    // skip the extra decode entirely when running the multi strategy.
    if (PIP_STRATEGY !== "single") return;
    const { standard, webkit } = getPipSupport();
    if (!standard && !webkit) return;

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.style.position = "fixed";
    video.style.pointerEvents = "none";
    if (isSafari) {
      // Safari stops decoding fully off-screen videos — keep it barely visible.
      video.style.right = "0";
      video.style.bottom = "0";
      video.style.width = "16px";
      video.style.height = "9px";
      video.style.objectFit = "cover";
      video.style.opacity = "0.01";
      video.style.zIndex = "0";
    } else {
      video.style.left = "-9999px";
      video.style.top = "0";
      video.style.width = "1px";
      video.style.height = "1px";
    }
    document.body.appendChild(video);

    const onEnter = () => setPipMode(true);
    const onLeave = () => setPipMode(false);
    const onWebkitModeChange = () => {
      setPipMode(video.webkitPresentationMode === "picture-in-picture");
    };
    video.addEventListener("enterpictureinpicture", onEnter);
    video.addEventListener("leavepictureinpicture", onLeave);
    video.addEventListener(
      "webkitpresentationmodechanged",
      onWebkitModeChange
    );

    pipVideoRef.current = video;

    return () => {
      video.removeEventListener("enterpictureinpicture", onEnter);
      video.removeEventListener("leavepictureinpicture", onLeave);
      video.removeEventListener(
        "webkitpresentationmodechanged",
        onWebkitModeChange
      );
      exitSinglePip();
      if (clonedTrackRef.current) {
        try {
          clonedTrackRef.current.stop();
        } catch (e) {}
        clonedTrackRef.current = null;
      }
      video.srcObject = null;
      video.remove();
      pipVideoRef.current = null;
      // Also close multi-PiP — it outlives React on document.body.
      exitMultiPip();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Feed a CLONE of the webcam into the hidden video — Safari can't share
  // one track across two <video> elements.
  useEffect(() => {
    const video = pipVideoRef.current;
    if (!video) return;

    if (clonedTrackRef.current) {
      try {
        clonedTrackRef.current.stop();
      } catch (e) {}
      clonedTrackRef.current = null;
    }

    if (webcamOn && webcamStream && webcamStream.track) {
      try {
        const cloned = webcamStream.track.clone();
        clonedTrackRef.current = cloned;
        video.srcObject = new MediaStream([cloned]);
        video.play().catch(() => {});
      } catch (e) {
        console.log("Failed to prepare local webcam for PiP", e);
        video.srcObject = null;
      }
    } else {
      video.srcObject = null;
    }
  }, [webcamStream, webcamOn]);

  // SINGLE-PARTICIPANT PiP (local webcam only): direct track, no paint
  // loop, so it survives backgrounding everywhere.
  const togglePipModeSingle = () => {
    const video = pipVideoRef.current;
    if (!video) {
      toast("Picture-in-Picture is not supported by your browser", pipToastOptions);
      return;
    }
    if (!video.srcObject) {
      toast("Turn on your camera to use Picture-in-Picture", pipToastOptions);
      return;
    }

    if (isSafari) {
      if (video.webkitPresentationMode === "picture-in-picture") {
        video.webkitSetPresentationMode("inline");
        return;
      }
      if (
        typeof video.webkitSupportsPresentationMode !== "function" ||
        !video.webkitSupportsPresentationMode("picture-in-picture")
      ) {
        toast("Picture-in-Picture is not supported by your browser", pipToastOptions);
        return;
      }
      try {
        video.webkitSetPresentationMode("picture-in-picture");
      } catch (e) {
        console.log("Safari PiP failed", e);
      }
      return;
    }

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch((e) => console.log(e));
      return;
    }
    if (!("pictureInPictureEnabled" in document)) {
      toast("Picture-in-Picture is not supported by your browser", pipToastOptions);
      return;
    }
    video
      .requestPictureInPicture()
      .catch((e) => console.log("Failed to enter PiP mode", e));
  };

  // MULTI-PARTICIPANT PiP: paint all rendered tiles into a canvas grid,
  // captureStream() it, and feed that to the PiP video.
  const togglePipModeMulti = () => {
    // If already active, exit.
    if (pipMultiWindowRef.current) {
      exitMultiPip();
      return;
    }

    const { standard, webkit } = getPipSupport();
    if (!standard && !webkit) {
      toast("Picture-in-Picture is not supported by your browser", pipToastOptions);
      return;
    }

    const source = document.createElement("canvas");
    source.width = 640;
    source.height = 360;
    const ctx = source.getContext("2d");

    const pipVideo = document.createElement("video");
    pipVideo.autoplay = true;
    pipVideo.muted = true;
    pipVideo.playsInline = true;
    pipVideo.width = source.width;
    pipVideo.height = source.height;
    // Safari refuses to enter PiP from a fully off-screen video; keep it barely visible.
    pipVideo.style.position = "fixed";
    pipVideo.style.right = "0";
    pipVideo.style.bottom = "0";
    pipVideo.style.width = "16px";
    pipVideo.style.height = "9px";
    pipVideo.style.opacity = "0.01";
    pipVideo.style.pointerEvents = "none";
    document.body.appendChild(pipVideo);
    pipMultiWindowRef.current = pipVideo;

    // Paint loop — setInterval, not rAF (rAF suspends on tab switch).
    let drawInterval = null;
    const startDraw = () => {
      if (drawInterval) return;
      drawInterval = setInterval(drawCanvas, 33);
    };
    const stopDraw = () => {
      if (!drawInterval) return;
      clearInterval(drawInterval);
      drawInterval = null;
    };

    // Backgrounded Safari throttles timers to ~1Hz (freezing the grid);
    // the audio thread is exempt, so a silent ScriptProcessorNode acts as
    // a ~23fps paint clock. Must be created inside the click gesture.
    // Runs alongside the interval on purpose — each clock is the other's
    // fallback and paints are cheap. (ScriptProcessorNode is deprecated;
    // AudioWorklet is the eventual replacement.)
    let audioTicker = null;
    if (isSafari) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const actx = new AC();
        const node = actx.createScriptProcessor(2048, 1, 1);
        const silence = actx.createGain();
        silence.gain.value = 0;
        node.connect(silence);
        silence.connect(actx.destination);
        node.onaudioprocess = () => drawCanvas();
        actx.resume().catch(() => {});
        audioTicker = { actx, node };
      } catch (e) {
        console.log("[PiP-Multi] audio paint clock unavailable", e);
      }
    }

    const cleanup = () => {
      stopDraw();
      if (audioTicker) {
        try {
          audioTicker.node.onaudioprocess = null;
          audioTicker.node.disconnect();
          audioTicker.actx.close();
        } catch (e) {}
        audioTicker = null;
      }
      setPipMode(false);
      if (pipVideo.srcObject) {
        pipVideo.srcObject.getTracks().forEach((t) => t.stop());
      }
      pipVideo.remove();
      pipMultiWindowRef.current = null;
      pipMultiCleanupRef.current = null;
    };
    pipMultiCleanupRef.current = cleanup;

    // iOS pauses on-page videos on backgrounding but allows play() while
    // hidden — so poll a play() nudge from the paint loop to un-pause
    // them. (visibilitychange may never fire while PiP is active.)
    let nudgeTick = 0;
    function nudgeSources() {
      nudgeTick = (nudgeTick + 1) % 30; // roughly 1×/sec; varies with active paint clocks
      if (nudgeTick !== 0) return;
      document.querySelectorAll("video").forEach((v) => {
        if (v === pipVideo) return;
        if (v.srcObject) v.play().catch(() => {});
      });
    }

    function drawCanvas() {
      if (isIOS) nudgeSources();
      // One <video> per track — a participant can render in several nodes.
      const seen = new Set();
      const videos = [];
      document.querySelectorAll("video").forEach((v) => {
        if (v === pipVideo) return;
        // Skip the single-PiP helper — its CLONE evades the track dedupe.
        if (v === pipVideoRef.current) return;
        if (!v.videoWidth || !v.videoHeight) return;
        const s = v.srcObject;
        const track = s && s.getVideoTracks && s.getVideoTracks()[0];
        const key = track ? track.id : v;
        if (seen.has(key)) return;
        seen.add(key);
        videos.push(v);
      });
      try {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, source.width, source.height);
        const rows = getRowCount(videos.length);
        const columns = getColCount(videos.length);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            const idx = j + i * columns;
            if (idx < videos.length) {
              ctx.drawImage(
                videos[idx],
                j * (source.width / columns),
                i * (source.height / rows),
                source.width / columns,
                source.height / rows
              );
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    pipVideo.addEventListener("enterpictureinpicture", () => {
      setPipMode(true);
      startDraw();
    });
    pipVideo.addEventListener("leavepictureinpicture", cleanup);
    pipVideo.addEventListener("webkitpresentationmodechanged", () => {
      if (pipVideo.webkitPresentationMode === "picture-in-picture") {
        setPipMode(true);
        startDraw();
      } else {
        cleanup();
      }
    });

    // Prime the canvas before captureStream or Safari drops the stream.
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, source.width, source.height);
    drawCanvas();
    drawCanvas();
    drawCanvas();

    const stream =
      typeof source.captureStream === "function"
        ? source.captureStream(30)
        : null;
    if (!stream) {
      toast("Picture-in-Picture is not supported by your browser", pipToastOptions);
      cleanup();
      return;
    }
    pipVideo.srcObject = stream;

    // Don't await — Safari never fires loadedmetadata for canvas streams.
    pipVideo.play().catch((e) => console.log("[PiP-Multi] play() rejected", e));

    if (isSafari) {
      // Safari advertises PiP support only after a frame has played — poll.
      const trySafariPip = (attempt = 0) => {
        if (!pipMultiWindowRef.current) return;
        const canWebkit =
          typeof pipVideo.webkitSupportsPresentationMode === "function" &&
          pipVideo.webkitSupportsPresentationMode("picture-in-picture");
        if (canWebkit) {
          try {
            pipVideo.webkitSetPresentationMode("picture-in-picture");
          } catch (e) {
            console.log("[PiP-Multi] enter failed", e);
            cleanup();
          }
          return;
        }
        if (attempt >= 20) {
          toast("Picture-in-Picture is not supported by your browser", pipToastOptions);
          cleanup();
          return;
        }
        // Keep painting so the stream advances, then re-check.
        drawCanvas();
        setTimeout(() => trySafariPip(attempt + 1), 100);
      };
      trySafariPip();
    } else {
      const enterChromePip = async () => {
        try {
          await pipVideo.requestPictureInPicture();
        } catch (e) {
          console.log("[PiP-Multi] enter failed", e);
          cleanup();
        }
      };
      if (pipVideo.readyState >= 1) {
        enterChromePip();
      } else {
        pipVideo.addEventListener("loadedmetadata", enterChromePip, { once: true });
      }
    }
  };

  return isMobile || isTab ? (
    <MobileIconButton
      id="pip-btn"
      tooltipTitle={pipMode ? "Stop PiP" : "Start Pip"}
      buttonText={pipMode ? "Stop PiP" : "Start Pip"}
      isFocused={pipMode}
      Icon={PipIcon}
      onClick={
        PIP_STRATEGY === "single" ? togglePipModeSingle : togglePipModeMulti
      }
      disabled={false}
    />
  ) : (
    <OutlinedButton
      Icon={PipIcon}
      onClick={
        PIP_STRATEGY === "single" ? togglePipModeSingle : togglePipModeMulti
      }
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
