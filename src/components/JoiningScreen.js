import {
  Box,
  Button,
  useTheme,
  Grid,
  makeStyles,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { VideocamOff, MicOff, Mic, Videocam } from "@material-ui/icons";
import useResponsiveSize from "../utils/useResponsiveSize";
import { red } from "@material-ui/core/colors";
import { MeetingDetailsScreen } from "./MeetingDetailsScreen";
import { createMeeting, getToken, validateMeeting } from "../api";

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
  setWebcamOn,
  setMicOn,
  micOn,
  webcamOn,
  onClickStartMeeting,
}) {
  const videoPlayerRef = useRef();

  const theme = useTheme();
  const styles = useStyles(theme);
  const classes = useStyles();

  const [videoTrack, setVideoTrack] = useState(null);

  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);

  const [settingDialogueOpen, setSettingDialogueOpen] = useState(false);

  const handleClickOpen = () => {
    setSettingDialogueOpen(true);
  };

  const handleClose = (value) => {
    setSettingDialogueOpen(false);
  };

  const isXStoSM = useMediaQuery(theme.breakpoints.between("xs", "sm"));
  const gtThenMD = useMediaQuery(theme.breakpoints.up("md"));
  const gtThenXL = useMediaQuery(theme.breakpoints.only("xl"));
  const gtThenLG = useMediaQuery(theme.breakpoints.up("lg"));

  const isXSOnly = useMediaQuery(theme.breakpoints.only("xs"));
  const isSMOnly = useMediaQuery(theme.breakpoints.only("sm"));
  const isXLOnly = useMediaQuery(theme.breakpoints.only("xl"));
  const isMDOnly = useMediaQuery(theme.breakpoints.only("md"));

  const padding = useResponsiveSize({
    xl: 10,
    lg: 10,
    md: 8,
    sm: 6,
    xs: 1.5,
  });

  const _handleToggleMic = () => {
    setMicOn(!micOn);
  };
  const _handleToggleWebcam = () => {
    if (!webcamOn) {
      getVideo();
    } else {
      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
      }
    }
    setWebcamOn(!webcamOn);
  };

  const getVideo = async () => {
    if (videoPlayerRef.current) {
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

      videoPlayerRef.current.srcObject = new MediaStream([videoTrack]);
      videoPlayerRef.current.play();
      if (!videoTrack) {
        setWebcamOn(false);
      }
      setVideoTrack(videoTrack);
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
    lg: 190,
    md: 80,
    sm: 160,
  });
  const spacingHorizontalTopics = useResponsiveSize(
    spacingHorizontalTopicsObject
  );

  useEffect(() => {
    if (webcamOn && !videoTrack) {
      getVideo();
    }
  }, [webcamOn]);

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
          m={isXStoSM ? 8 : isMDOnly ? 0 : 9}
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

                      {/* {settingDialogueOpen ? (
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
                          participantCanToggleSelfMic={
                            participantCanToggleSelfMic
                          }
                          participantCanToggleSelfWebcam={
                            participantCanToggleSelfWebcam
                          }
                          // appTheme={appTheme}
                        />
                      ) : null} */}

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
                                onClick={() => _handleToggleWebcam()}
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
                  {/* {!isXSOnly && (
                    <Box
                      style={{
                        position: "absolute",
                        left: spacingSettingChip,
                        right: spacingSettingChip,
                        bottom: -72,
                        // top: 0,
                        backgroundColor: theme.palette.darkTheme.seven,
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
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
                  )} */}
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
              <div className="w-full flex flex-1 flex-col items-center justify-center xl:m-16 lg:m-14 md:mx-24 md:mt-4 ">
                <MeetingDetailsScreen
                  participantName={participantName}
                  setParticipantName={setParticipantName}
                  videoTrack={videoTrack}
                  setVideoTrack={setVideoTrack}
                  onClickStartMeeting={onClickStartMeeting}
                  onClickJoin={async (id) => {
                    const token = await getToken();
                    const valid = await validateMeeting({
                      meetingId: id,
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
                    } else alert("Invalid Meeting Id");
                  }}
                  onClickCreateMeeting={async () => {
                    const token = await getToken();
                    const _meetingId = await createMeeting({ token });
                    setToken(token);
                    setMeetingId(_meetingId);
                    return _meetingId;
                  }}
                />
              </div>
            </Grid>
          </Grid>

          {/* <ConfirmBox
            appTheme={appTheme}
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
            appTheme={appTheme}
            open={dlgDevices}
            successText="DISMISS"
            onSuccess={() => {
              setDlgDevices(false);
            }}
            title="Mic or webcam not available"
            subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
          /> */}
        </Box>
      </Box>
    </>
  );
}
