import React, { useEffect, useMemo, useRef, useState } from "react";
import { Popover, useTheme } from "@material-ui/core";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import { nameTructed } from "../../utils/helper";
import { MicOff } from "@material-ui/icons";
import ReactPlayer from "react-player";
import { getQualityScore } from "../../utils/common";
import useResponsiveSize from "../../hooks/useResponsiveSize";
import NetworkIcon from "../../icons/NetworkIcon";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";
import { CloseOutlined } from "@material-ui/icons";

export const CornerDisplayName = ({
  participantId,
  isPresenting,
  displayName,
  isLocal,
  micOn,
  screenShareStream,
  mouseOver,
}) => {
  const isMobile = useIsMobile();
  const isTab = useIsTab();

  const analyzerSize = useResponsiveSize({
    xl: 32,
    lg: 28,
    md: 24,
    sm: 20,
    xs: 18,
  });

  const show = useMemo(() => mouseOver, [mouseOver]);

  const {
    webcamStream,
    micStream,
    getVideoStats,
    getAudioStats,
    getShareStats,
  } = useParticipant(participantId);

  const statsIntervalIdRef = useRef();
  const [score, setScore] = useState({});
  const [audioStats, setAudioStats] = useState({});
  const [videoStats, setVideoStats] = useState({});

  const [downArrow, setDownArrow] = useState(null);
  const handleClick = (event) => {
    setDownArrow(event.currentTarget);
  };

  const handleClose = () => {
    setDownArrow(null);
  };

  const updateStats = async () => {
    let stats = [];
    let audioStats = [];
    let videoStats = [];
    if (isPresenting) {
      stats = await getShareStats();
    } else if (webcamStream) {
      stats = await getVideoStats();
    } else if (micStream) {
      stats = await getAudioStats();
    }

    if (webcamStream || micStream || isPresenting) {
      videoStats = isPresenting ? await getShareStats() : await getVideoStats();
      audioStats = isPresenting ? [] : await getAudioStats();
    }

    // setScore(stats?.score);
    let score = stats
      ? stats.length > 0
        ? getQualityScore(stats[0])
        : 100
      : 100;

    setScore(score);
    setAudioStats(audioStats);
    setVideoStats(videoStats);
  };

  const qualityStateArray = [
    { label: "", audio: "Audio", video: "Video" },
    {
      label: "Latency",
      audio:
        audioStats && audioStats[0]?.rtt ? `${audioStats[0]?.rtt} ms` : "-",
      video:
        videoStats && videoStats[0]?.rtt ? `${videoStats[0]?.rtt} ms` : "-",
    },
    {
      label: "Jitter",
      audio:
        audioStats && audioStats[0]?.jitter
          ? `${parseFloat(audioStats[0]?.jitter).toFixed(2)} ms`
          : "-",
      video:
        videoStats && videoStats[0]?.jitter
          ? `${parseFloat(videoStats[0]?.jitter).toFixed(2)} ms`
          : "-",
    },
    {
      label: "Packet Loss",
      audio: audioStats
        ? audioStats[0]?.packetsLost
          ? `${parseFloat(
              (audioStats[0]?.packetsLost * 100) / audioStats[0]?.totalPackets
            ).toFixed(2)}%`
          : "-"
        : "-",
      video: videoStats
        ? videoStats[0]?.packetsLost
          ? `${parseFloat(
              (videoStats[0]?.packetsLost * 100) / videoStats[0]?.totalPackets
            ).toFixed(2)}%`
          : "-"
        : "-",
    },
    {
      label: "Bitrate",
      audio:
        audioStats && audioStats[0]?.bitrate
          ? `${parseFloat(audioStats[0]?.bitrate).toFixed(2)} kb/s`
          : "-",
      video:
        videoStats && videoStats[0]?.bitrate
          ? `${parseFloat(videoStats[0]?.bitrate).toFixed(2)} kb/s`
          : "-",
    },
    {
      label: "Frame rate",
      audio: "-",
      video:
        videoStats &&
        (videoStats[0]?.size?.framerate === null ||
          videoStats[0]?.size?.framerate === undefined)
          ? "-"
          : `${videoStats ? videoStats[0]?.size?.framerate : "-"}`,
    },
    {
      label: "Resolution",
      audio: "-",
      video: videoStats
        ? videoStats && videoStats[0]?.size?.width === null
          ? "-"
          : `${videoStats[0]?.size?.width}x${videoStats[0]?.size?.height}`
        : "-",
    },
    {
      label: "Codec",
      audio: audioStats && audioStats[0]?.codec ? audioStats[0]?.codec : "-",
      video: videoStats && videoStats[0]?.codec ? videoStats[0]?.codec : "-",
    },
    {
      label: "Cur. Layers",
      audio: "-",
      video:
        videoStats && !isLocal
          ? videoStats && videoStats[0]?.currentSpatialLayer === null
            ? "-"
            : `S:${videoStats[0]?.currentSpatialLayer || 0} T:${
                videoStats[0]?.currentTemporalLayer || 0
              }`
          : "-",
    },
    {
      label: "Pref. Layers",
      audio: "-",
      video:
        videoStats && !isLocal
          ? videoStats && videoStats[0]?.preferredSpatialLayer === null
            ? "-"
            : `S:${videoStats[0]?.preferredSpatialLayer || 0} T:${
                videoStats[0]?.preferredTemporalLayer || 0
              }`
          : "-",
    },
  ];

  useEffect(() => {
    if (webcamStream || micStream) {
      updateStats();

      if (statsIntervalIdRef.current) {
        clearInterval(statsIntervalIdRef.current);
      }

      statsIntervalIdRef.current = setInterval(updateStats, 100);
    } else {
      if (statsIntervalIdRef.current) {
        clearInterval(statsIntervalIdRef.current);
        statsIntervalIdRef.current = null;
      }
    }

    return () => {
      if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
    };
  }, [webcamStream, micStream]);

  return (
    <>
      <div
        className="absolute bottom-2 left-2 rounded-md flex items-center justify-center p-2"
        style={{
          backgroundColor: "#00000066",
          transition: "all 200ms",
          transitionTimingFunction: "linear",
          transform: `scale(${show ? 1 : 0})`,
        }}
      >
        {!micOn && !isPresenting && (
          <MicOff fontSize="small" style={{ color: "white" }}></MicOff>
        )}
        <p className="text-sm text-white">
          {isPresenting
            ? isLocal
              ? `You are presenting`
              : `${nameTructed(displayName, 15)} is presenting`
            : isLocal
            ? "You"
            : nameTructed(displayName, 26)}
        </p>
      </div>

      {(webcamStream || micStream || screenShareStream) && (
        <div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e);
            }}
            className="absolute top-2 right-2 rounded-md flex items-center justify-center p-2 cursor-pointer"
            style={{
              backgroundColor:
                score > 7 ? "#3BA55D" : score > 4 ? "#faa713" : "#FF5D5D",
              transition: "all 200ms",
              transitionTimingFunction: "linear",
              transform: `scale(${show ? 1 : 0})`,
            }}
          >
            <NetworkIcon
              color1={"#ffffff"}
              color2={"#ffffff"}
              color3={"#ffffff"}
              color4={"#ffffff"}
              style={{
                height: analyzerSize * 0.6,
                width: analyzerSize * 0.6,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: show ? (isMobile ? 4 : isTab ? 8 : 12) : -32,
              right: show ? (isMobile ? 4 : isTab ? 8 : 12) : -42,
            }}
          >
            <Popover
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              anchorEl={downArrow}
              open={Boolean(downArrow)}
              onClose={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <div>
                <div
                  className={`p-[9px] flex items-center justify-between `}
                  style={{
                    backgroundColor:
                      score > 7 ? "#3BA55D" : score > 4 ? "#faa713" : "#FF5D5D",
                  }}
                >
                  <p className="text-sm text-white font-semibold">{`Quality Score : ${
                    score > 7 ? "Good" : score > 4 ? "Average" : "Poor"
                  }`}</p>

                  <button className="cursor-pointer" onClick={handleClose}>
                    <CloseOutlined style={{ height: 16, width: 16 }} />
                  </button>
                </div>
                <div className="flex">
                  <div className="flex flex-col">
                    {qualityStateArray.map((item, index) => {
                      return (
                        <div
                          className="flex"
                          style={{
                            borderBottom:
                              index === qualityStateArray.length - 1
                                ? ""
                                : `1px solid #ffffff33`,
                          }}
                        >
                          <div className="flex flex-1 items-center w-[120px]">
                            {index !== 0 && (
                              <p className="text-xs my-[6px] ml-2">
                                {item.label}
                              </p>
                            )}
                          </div>
                          <div
                            className="flex flex-1 items-center justify-center"
                            style={{ borderLeft: `1px solid #ffffff33` }}
                          >
                            <p className="text-xs my-[6px] w-[65px] text-center">
                              {item.audio}
                            </p>
                          </div>
                          <div
                            className="flex flex-1 items-center justify-center"
                            style={{
                              borderLeft: `1px solid #ffffff33`,
                            }}
                          >
                            <p className="text-xs my-[6px] w-[65px] text-center">
                              {item.video}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Popover>
          </div>
        </div>
      )}
    </>
  );
};

function ParticipantView({ participantId }) {
  const {
    displayName,
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    mode,
  } = useParticipant(participantId);

  const micRef = useRef(null);
  const [mouseOver, setMouseOver] = useState(false);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);
  const webcamMediaStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);
  return mode === "CONFERENCE" ? (
    <div
      onMouseEnter={() => {
        setMouseOver(true);
      }}
      onMouseLeave={() => {
        setMouseOver(false);
      }}
      className={`h-full w-full  bg-gray-750 relative overflow-hidden rounded-lg video-cover`}
    >
      <audio ref={micRef} autoPlay />
      {webcamOn ? (
        <ReactPlayer
          //
          playsinline // very very imp prop
          playIcon={<></>}
          //
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          //
          url={webcamMediaStream}
          //
          height={"100%"}
          width={"100%"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div
            className={`z-10 flex items-center justify-center rounded-full bg-gray-800 2xl:h-[92px] h-[52px] 2xl:w-[92px] w-[52px]`}
          >
            <p className="text-2xl text-white">
              {String(displayName).charAt(0).toUpperCase()}
            </p>
          </div>
        </div>
      )}
      <CornerDisplayName
        {...{
          isLocal,
          displayName,
          micOn,
          webcamOn,
          isPresenting: false,
          participantId,
          mouseOver,
        }}
      />
    </div>
  ) : null;
}
export function ILSParticipantView({ isPresenting, sideBarMode }) {
  const theme = useTheme();
  const mMeeting = useMeeting();

  const participants = [];
  mMeeting?.participants.forEach((values, keys) => {
    if (values.mode === "CONFERENCE") {
      participants.push(values.id);
    }
  });

  const isXStoSM = theme.breakpoints.between("xs", "sm");
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  const perRow =
    isMobile || isPresenting
      ? participants.length < 4
        ? 1
        : participants.length < 9
        ? 2
        : 3
      : participants.length < 5
      ? 2
      : participants.length < 7
      ? 3
      : participants.length < 9
      ? 4
      : participants.length < 10
      ? 3
      : participants.length < 11
      ? 4
      : 4;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isXStoSM ? "column" : "row",
        flexGrow: 1,
        margin: 12,
        justifyContent: "center",
        alignItems: "center",
      }}
      className={`${
        participants.length < 2 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-2"
          : participants.length < 3 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-8"
          : participants.length < 4 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-4"
          : participants.length > 4 && !sideBarMode && !isPresenting
          ? "md:px-14"
          : "md:px-0"
      }`}
    >
      <div className="flex flex-col w-full h-full">
        {Array.from(
          { length: Math.ceil(participants.length / perRow) },
          (_, i) => {
            return (
              <div
                key={`participant-${i}`}
                className={`flex flex-1 ${
                  isPresenting
                    ? participants.length === 1
                      ? "justify-start items-start"
                      : "items-center justify-center"
                    : "items-center justify-center"
                }`}
              >
                {participants
                  .slice(i * perRow, (i + 1) * perRow)
                  .map((participantId) => {
                    return (
                      <div
                        key={`participant_${participantId}`}
                        className={`flex flex-1 ${
                          isPresenting
                            ? participants.length === 1
                              ? "md:h-48 md:w-44 xl:w-52 xl:h-48 "
                              : participants.length === 2
                              ? "md:w-44 xl:w-56"
                              : "md:w-44 xl:w-48"
                            : "w-full"
                        } items-center justify-center h-full ${
                          participants.length === 1
                            ? "md:max-w-7xl 2xl:max-w-[1480px] "
                            : "md:max-w-lg 2xl:max-w-2xl"
                        } overflow-clip overflow-hidden  p-1`}
                      >
                        <ParticipantView participantId={participantId} />
                      </div>
                    );
                  })}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
