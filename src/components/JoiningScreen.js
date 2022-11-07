import {
  Box,
  Button,
  useTheme,
  Grid,
  makeStyles,
  Tooltip,
  Typography,
  useMediaQuery,
  IconButton,
} from "@material-ui/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { VideocamOff, MicOff, Mic, Videocam } from "@material-ui/icons";
import useResponsiveSize from "../hooks/useResponsiveSize";
import { red } from "@material-ui/core/colors";
import { MeetingDetailsScreen } from "./MeetingDetailsScreen";
import { createMeeting, getToken, validateMeeting } from "../api";
import { CheckCircleIcon } from "@heroicons/react/outline";
import SettingDialogueBox from "./SettingDialogueBox";
import ConfirmBox from "./ConfirmBox";

const useStyles = makeStyles((theme) => ({
  video: {
    borderRadius: "10px",
    backgroundColor: "#1c1c1c",
    height: "100%",
    width: "100%",
    objectFit: "cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButton: {
    borderRadius: "100%",
    minWidth: "auto",
    width: "44px",
    height: "44px",
  },
  previewBox: {
    width: "100%",
    height: "45vh",
    position: "relative",
  },
}));

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
  meetingType,
  setMeetingType,
  setMeetingMode,
}) {
  const theme = useTheme();
  const classes = useStyles();

  const [setting, setSetting] = useState("video");
  const [{ webcams, mics }, setDevices] = useState({
    devices: [],
    webcams: [],
    mics: [],
  });

  const [videoTrack, setVideoTrack] = useState(null);

  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);

  const videoPlayerRef = useRef();
  const popupVideoPlayerRef = useRef();
  const popupAudioPlayerRef = useRef();

  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();

  const [settingDialogueOpen, setSettingDialogueOpen] = useState(false);

  const [audioTrack, setAudioTrack] = useState(null);

  const handleClickOpen = () => {
    setSettingDialogueOpen(true);
  };

  const handleClose = (value) => {
    setSettingDialogueOpen(false);
  };

  const isXStoSM = useMediaQuery(theme.breakpoints.between("xs", "sm"));
  const gtThenMD = useMediaQuery(theme.breakpoints.up("md"));
  const gtThenXL = useMediaQuery(theme.breakpoints.only("xl"));
  const isXSOnly = useMediaQuery(theme.breakpoints.only("xs"));
  const isSMOnly = useMediaQuery(theme.breakpoints.only("sm"));
  const isXLOnly = useMediaQuery(theme.breakpoints.only("xl"));

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

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });
    const videoTracks = stream.getVideoTracks();

    const videoTrack = videoTracks.length ? videoTracks[0] : null;

    setVideoTrack(videoTrack);
  };
  const changeMic = async (deviceId) => {
    const currentAudioTrack = audioTrackRef.current;
    currentAudioTrack && currentAudioTrack.stop();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
    });
    const audioTracks = stream.getAudioTracks();

    const audioTrack = audioTracks.length ? audioTracks[0] : null;
    clearInterval(audioAnalyserIntervalRef.current);

    setAudioTrack(audioTrack);
  };

  const getDefaultMediaTracks = async ({ mic, webcam, firstTime }) => {
    if (mic) {
      const audioConstraints = {
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(
        audioConstraints
      );
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
      const videoConstraints = {
        video: {
          width: 1280,
          height: 720,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(
        videoConstraints
      );
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

  const getDevices = async ({ micEnabled, webcamEnabled }) => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const webcams = devices.filter((d) => d.kind === "videoinput");
      const mics = devices.filter((d) => d.kind === "audioinput");

      const hasMic = mics.length > 0;
      const hasWebcam = webcams.length > 0;

      setDevices({ webcams, mics, devices });

      if (hasMic) {
        startMuteListener();
      }

      getDefaultMediaTracks({
        mic: hasMic && micEnabled,
        webcam: hasWebcam && webcamEnabled,
        firstTime: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const internalPadding = useResponsiveSize({
    xl: 3,
    lg: 3,
    md: 2,
    sm: 2,
    xs: 1.5,
  });

  const spacingHorizontalTopicsObject = {
    xl: 60,
    lg: 40,
    md: 40,
    sm: 40,
    xs: 32,
  };

  const spacingSettingChip = useResponsiveSize({
    xl: 190,
    lg: 175,
    md: 80,
    sm: 160,
  });
  const spacingHorizontalTopics = useResponsiveSize(
    spacingHorizontalTopicsObject
  );

  useEffect(() => {
    audioTrackRef.current = audioTrack;

    startMuteListener();
  }, [audioTrack]);

  useEffect(() => {
    videoTrackRef.current = videoTrack;

    if (videoTrack) {
      const videoSrcObject = new MediaStream([videoTrack]);

      if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = videoSrcObject;
        videoPlayerRef.current.play();
      }

      setTimeout(() => {
        if (popupVideoPlayerRef.current) {
          popupVideoPlayerRef.current.srcObject = videoSrcObject;
          popupVideoPlayerRef.current.play();
        }
      }, 1000);
    } else {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = null;
      }
      if (popupVideoPlayerRef.current) {
        popupVideoPlayerRef.current.srcObject = null;
      }
    }
  }, [videoTrack, setting, settingDialogueOpen]);

  useEffect(() => {
    getDevices({ micEnabled, webcamEnabled });
  }, []);

  return (
    <>
      <Box
        className="overflow-y-auto"
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          height: "100vh",
          backgroundColor: theme.palette.darkTheme.main,
        }}
      >
        <Box
          m={isXSOnly ? 8 : gtThenMD ? 9 : 0}
          style={{
            display: "flex",
            flex: 1,
            flexDirection: isXStoSM ? "column" : "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid
            container
            spacing={gtThenMD ? 0 : isXStoSM ? 0 : 9}
            style={{
              display: "flex",
              flex: isSMOnly ? 0 : 1,
              flexDirection: isXStoSM ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Grid
              item
              xs={12}
              md={gtThenXL ? 6 : 7}
              style={{
                display: "flex",
                flex: 1,
              }}
            >
              <Box
                style={{
                  width: isXSOnly ? "100%" : "100vw",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                p={internalPadding}
              >
                <Box
                  style={{
                    paddingLeft:
                      spacingHorizontalTopics -
                      (gtThenMD ? theme.spacing(10) : theme.spacing(2)),
                    paddingRight:
                      spacingHorizontalTopics -
                      (gtThenMD ? theme.spacing(10) : theme.spacing(2)),

                    position: "relative",
                    width: "100%",
                  }}
                >
                  <Box>
                    <Box className={classes.previewBox}>
                      <video
                        autoPlay
                        playsInline
                        muted
                        ref={videoPlayerRef}
                        controls={false}
                        className={classes.video + " flip"}
                      />

                      {!isXSOnly ? (
                        <>
                          <Box
                            style={{
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              right: 0,
                              left: 0,
                            }}
                          >
                            {!webcamOn ? (
                              <Typography variant={isXLOnly ? "h4" : "h6"}>
                                The camera is off
                              </Typography>
                            ) : null}
                          </Box>
                        </>
                      ) : null}

                      {settingDialogueOpen ? (
                        <SettingDialogueBox
                          open={settingDialogueOpen}
                          onClose={handleClose}
                          popupVideoPlayerRef={popupVideoPlayerRef}
                          popupAudioPlayerRef={popupAudioPlayerRef}
                          changeWebcam={changeWebcam}
                          changeMic={changeMic}
                          setting={setting}
                          setSetting={setSetting}
                          webcams={webcams}
                          mics={mics}
                          setSelectedMic={setSelectedMic}
                          setSelectedWebcam={setSelectedWebcam}
                          videoTrack={videoTrack}
                          audioTrack={audioTrack}
                        />
                      ) : null}

                      <Box
                        position="absolute"
                        bottom={theme.spacing(2)}
                        left="0"
                        right="0"
                      >
                        <Grid
                          container
                          alignItems="center"
                          justify="center"
                          spacing={2}
                        >
                          <Grid item>
                            <Tooltip
                              title={micOn ? "Turn off mic" : "Turn on mic"}
                              arrow
                              placement="top"
                            >
                              <Button
                                onClick={() => _handleToggleMic()}
                                variant="contained"
                                style={
                                  micOn
                                    ? {}
                                    : {
                                        backgroundColor: red[500],
                                        color: "white",
                                      }
                                }
                                className={classes.toggleButton}
                              >
                                {micOn ? <Mic /> : <MicOff />}
                              </Button>
                            </Tooltip>
                          </Grid>

                          <Grid item>
                            <Tooltip
                              title={
                                webcamOn ? "Turn off camera" : "Turn on camera"
                              }
                              arrow
                              placement="top"
                            >
                              <Button
                                onClick={() => _toggleWebcam()}
                                variant="contained"
                                style={
                                  webcamOn
                                    ? {}
                                    : {
                                        backgroundColor: red[500],
                                        color: "white",
                                      }
                                }
                                className={classes.toggleButton}
                              >
                                {webcamOn ? <Videocam /> : <VideocamOff />}
                              </Button>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Box>
                  {!isXSOnly && (
                    <Box
                      className="absolute md:left-52 lg:left-24 xl:left-44 md:right-52 lg:right-24 xl:right-44 rounded cursor-pointer bg-gray-700"
                      // style={{
                      //   position: "absolute",
                      //   display: "flex",
                      //   alignItems: "center",
                      //   justifyContent: "center",
                      //   left: spacingSettingChip,
                      //   right: spacingSettingChip,
                      //   backgroundColor: theme.palette.darkTheme.seven,
                      //   borderRadius: 4,
                      //   cursor: "pointer",
                      // }}
                      m={2}
                      onClick={(e) => {
                        handleClickOpen();
                      }}
                    >
                      <Box
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        m={0.5}
                      >
                        <IconButton
                          style={{
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </IconButton>
                        <Typography
                          variant="subtitle1"
                          style={{
                            marginLeft: 4,
                          }}
                        >
                          Check your audio and video
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={isXStoSM ? 5 : gtThenXL ? 6 : 5}
              style={{
                width: "100%",
                display: "flex",
                flex: 1,
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="w-full flex flex-1 flex-col items-center justify-center xl:m-16 lg:m-6 md:mx-44 md:mt-11 lg:mt-4">
                <MeetingDetailsScreen
                  participantName={participantName}
                  setParticipantName={setParticipantName}
                  videoTrack={videoTrack}
                  setVideoTrack={setVideoTrack}
                  meetingType={meetingType}
                  setMeetingType={setMeetingType}
                  setMeetingMode={setMeetingMode}
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
                  onClickCreateMeeting={async () => {
                    const token = await getToken();
                    const _meetingId = await createMeeting({ token });
                    setToken(token);
                    setMeetingId(_meetingId);
                    setParticipantName("");
                    return _meetingId;
                  }}
                />
              </div>
            </Grid>
          </Grid>

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
        </Box>
      </Box>
    </>
  );
}
