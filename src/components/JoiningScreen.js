import {
  TextField,
  Box,
  Button,
  InputAdornment,
  useTheme,
  Grid,
  makeStyles,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import {
  Person,
  VideocamOff,
  MicOff,
  Mic,
  Videocam,
  ArrowBack,
} from "@material-ui/icons";
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
  meetingId,
  setMeetingId,
  setToken,
  setWebcamOn,
  setMicOn,
  micOn,
  webcamOn,
  onClickStartMeeting,
}) {
  const [readyToJoin, setReadyToJoin] = useState(false);
  const videoPlayerRef = useRef();
  const theme = useTheme();
  const styles = useStyles(theme);

  const [videoTrack, setVideoTrack] = useState(null);

  const padding = useResponsiveSize({
    xl: 6,
    lg: 6,
    md: 6,
    sm: 4,
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

      setVideoTrack(videoTrack);
    }
  };

  useEffect(() => {
    if (webcamOn && !videoTrack) {
      getVideo();
    }
  }, [webcamOn]);

  return (
    <Box
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        height: "100vh",
        alignItems: "center",
        backgroundColor: theme.palette.background.default,
      }}>
      {readyToJoin ? (
        <Box
          position="absolute"
          style={{
            top: theme.spacing(2),
            right: 0,
            left: theme.spacing(2),
          }}>
          <IconButton
            onClick={() => {
              setReadyToJoin(false);
            }}>
            <ArrowBack />
          </IconButton>
        </Box>
      ) : null}
      <Grid
        item
        xs={12}
        md={6}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}>
        {readyToJoin ? (
          <Box
            m={6}
            style={{
              display: "flex",
              flex: 1,
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: padding,
            }}>
            <Box className={styles.previewBox}>
              <video
                autoplay
                playsInline
                muted
                ref={videoPlayerRef}
                controls={false}
                className={styles.video + " flip"}
              />

              {!webcamOn ? (
                <Box
                  position="absolute"
                  style={{
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    right: 0,
                    left: 0,
                  }}>
                  <Typography>Camera is Turned Off</Typography>
                </Box>
              ) : null}

              <Box
                position="absolute"
                bottom={theme.spacing(2)}
                left="0"
                right="0">
                <Grid
                  container
                  alignItems="center"
                  justify="center"
                  spacing={2}>
                  <Grid item>
                    <Tooltip
                      title={micOn ? "Turn off mic" : "Turn on mic"}
                      arrow
                      placement="top">
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
                        className={styles.toggleButton}>
                        {micOn ? <Mic /> : <MicOff />}
                      </Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip
                      title={webcamOn ? "Turn off camera" : "Turn on camera"}
                      arrow
                      placement="top">
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
                        className={styles.toggleButton}>
                        {webcamOn ? <Videocam /> : <VideocamOff />}
                      </Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <TextField
              style={{
                width: "100%",
                marginTop: "1rem",
              }}
              id="outlined"
              label="Name"
              helperText={
                participantName.length < 3
                  ? "Enter Name with which you would like to join meeting"
                  : ""
              }
              onChange={(e) => {
                setParticipantName(e.target.value);
              }}
              variant="outlined"
              defaultValue={participantName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      disabled={participantName.length < 3}
                      color="primary"
                      variant="contained"
                      onClick={(e) => {
                        if (videoTrack) {
                          videoTrack.stop();
                          setVideoTrack(null);
                        }
                        onClickStartMeeting();
                      }}
                      id={"btnJoin"}>
                      Start
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        ) : (
          <MeetingDetailsScreen
            onClickJoin={async (id) => {
              const token = await getToken();
              const valid = await validateMeeting({ meetingId: id, token });
              if (valid) {
                setReadyToJoin(true);
                setToken(token);
                setMeetingId(id);
                setWebcamOn(true);
                setMicOn(true);
              } else alert("Invalid Meeting Id");
            }}
            onClickCreateMeeting={async () => {
              const token = await getToken();
              const _meetingId = await createMeeting({ token });
              setToken(token);
              setMeetingId(_meetingId);
              setReadyToJoin(true);
              setWebcamOn(true);
              setMicOn(true);
            }}
          />
        )}
      </Grid>
    </Box>
  );
}
