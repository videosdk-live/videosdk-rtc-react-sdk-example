import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Box,
  IconButton,
  makeStyles,
  Popover,
  Typography,
  useTheme,
} from "@material-ui/core";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import { nameTructed } from "../../utils/helper";
import { CloseOutlined, MicOff } from "@material-ui/icons";
import ReactPlayer from "react-player";

function ParticipantView({ participantId }) {
  const {
    displayName,
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    getVideoStats,
    getAudioStats,
    getShareStats,
  } = useParticipant(participantId);
  const micRef = useRef(null);
  const mMeeting = useMeeting();
  const isPresenting = mMeeting.isPresenting;

  const statsIntervalIdRef = useRef();
  const [score, setScore] = useState({});
  const [audioStats, setAudioStats] = useState({});
  const [videoStats, setVideoStats] = useState({});

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
    // let score = stats
    //   ? stats.length > 0
    //     ? getQualityScore(stats[0])
    //     : 100
    //   : 100;

    // setScore(score);
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

      statsIntervalIdRef.current = setInterval(updateStats, 500);
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
  return (
    <div
      className={`h-full w-full  bg-gray-750 relative overflow-hidden rounded-lg video-cover`}
    >
      <div
        className="absolute bottom-2 left-2 rounded-md flex items-center justify-center p-2"
        style={{
          backgroundColor: "#00000066",
          transition: "all 200ms",
          transitionTimingFunction: "linear",
        }}
      >
        {!micOn ? (
          <MicOff fontSize="small" style={{ color: "white" }}></MicOff>
        ) : (
          <></>
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

      <audio ref={micRef} autoPlay muted={isLocal} />
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
          // style={flipStyle}
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
      <div
        className="absolute z-5 top-2 left-2 rounded-md flex items-center justify-center p-2"
        style={{
          backgroundColor: "#00000066",
          transition: "all 200ms",
          transitionTimingFunction: "linear",
        }}
      >
        <Box>
          <Box style={{ display: "flex" }}>
            <Box style={{ display: "flex", flexDirection: "column" }}>
              {qualityStateArray.map((item, index) => {
                return (
                  <Box
                    style={{
                      display: "flex",
                      borderBottom:
                        index === qualityStateArray.length - 1
                          ? ""
                          : `1px solid ${"#ffffff33"}`,
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        flex: 1,
                        width: 120,
                        alignItems: "center",
                      }}
                    >
                      {index !== 0 && (
                        <Typography
                          style={{
                            fontSize: 12,
                            marginTop: 6,
                            marginBottom: 6,
                            marginLeft: 8,
                          }}
                        >
                          {item.label}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      style={{
                        display: "flex",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        borderLeft: `1px solid ${"#ffffff33"}`,
                      }}
                    >
                      <Typography
                        style={{
                          fontSize: 12,
                          marginTop: 6,
                          marginBottom: 6,
                          width: 65,
                          textAlign: "center",
                        }}
                      >
                        {item.audio}
                      </Typography>
                    </Box>
                    <Box
                      style={{
                        display: "flex",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        borderLeft: `1px solid ${"#ffffff33"}`,
                      }}
                    >
                      <Typography
                        style={{
                          fontSize: 12,
                          marginTop: 6,
                          marginBottom: 6,
                          width: 65,
                          textAlign: "center",
                        }}
                      >
                        {item.video}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
}
export function ParticipantsViewer({ isPresenting, sideBarMode }) {
  const theme = useTheme();
  const mMeeting = useMeeting();

  const participants = isPresenting
    ? [...mMeeting?.participants.keys()].slice(0, 6)
    : [...mMeeting?.participants.keys()];

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
          : participants.length < 4 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-10"
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
