import {
  Box,
  Button,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React, { useEffect, useRef, useState } from "react";
import useResponsiveSize from "../utils/useResponsiveSize";
import useWindowSize from "../utils/useWindowSize";
import ConfirmBox from "./ConfirmBox";

const AudioAnalyser = ({ audioTrack }) => {
  const theme = useTheme();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();

  const [volume, setVolume] = useState(null);

  const analyseAudio = (audioTrack) => {
    const audioStream = new MediaStream([audioTrack]);
    const audioContext = new AudioContext();

    const audioSource = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;

    audioSource.connect(analyser);

    const volumes = new Uint8Array(analyser.frequencyBinCount);
    const volumeCallback = () => {
      analyser.getByteFrequencyData(volumes);

      const volumeSum = volumes.reduce((sum, vol) => sum + vol);
      const averageVolume = volumeSum / volumes.length;

      setVolume(averageVolume);
    };

    audioAnalyserIntervalRef.current = setInterval(volumeCallback, 100);
  };

  const stopAudioAnalyse = () => {
    clearInterval(audioAnalyserIntervalRef.current);
  };

  useEffect(() => {
    audioTrackRef.current = audioTrack;

    if (audioTrack) {
      analyseAudio(audioTrack);
    } else {
      stopAudioAnalyse();
    }
  }, [audioTrack]);

  return (
    <Box
      style={{
        width: 80,
        height: 100,
        position: "relative",
      }}
    >
      {[
        {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: 100,
          borderTopRightRadius: 100,
          top: 0,
          alignItems: "flex-end",
        },
        {
          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 100,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          top: "50%",
          alignItems: "flex-start",
        },
      ].map(
        (
          {
            alignItems,
            top,
            borderBottomLeftRadius,
            borderBottomRightRadius,
            borderTopLeftRadius,
            borderTopRightRadius,
          },
          i
        ) => (
          <Box
            key={`audio_analyzer_i_${i}`}
            style={{
              height: "50%",
              display: "flex",
              justifyContent: "space-evenly",
              alignItems,
              position: "absolute",
              top,
              left: 0,
              right: 0,
            }}
          >
            {[40, 70, 100, 100, 70, 40].map((height, j) => (
              <Box
                key={`audio_analyzer_j_${j}`}
                style={{
                  borderBottomLeftRadius,
                  borderBottomRightRadius,
                  borderTopLeftRadius,
                  borderTopRightRadius,
                  backgroundColor: theme.palette.primary.main,
                  width: 80 / 12,
                  height: `${(volume / 256) * height}%`,
                  transition: "all 50ms",
                  transitionTimingFunction: "ease-in",
                }}
              ></Box>
            ))}
          </Box>
        )
      )}
    </Box>
  );
};

const useStyles = makeStyles((theme) => ({
  selectIcon: {
    color: "#404B53",
  },
  paperDark: {
    background: "#232830",
    color: "#fff",
  },
  video: {
    borderRadius: "6px",
    backgroundColor: "#1c1c1c",
    height: "100%",
    width: "100%",
    objectFit: "cover",
  },
  buttonLight: {
    "&:hover": {
      backgroundColor: "#596BFF",
    },
  },
}));

export default function SettingDialogueBox({
  open,
  onClose,
  popupVideoPlayerRef,
  webcams,
  mics,
  setting,
  setSetting,
  setSelectedMic,
  setSelectedWebcam,
  changeWebcam,
  changeMic,
  videoTrack,
  audioTrack,
}) {
  const theme = useTheme();
  const classes = useStyles();

  const isXStoSM = useMediaQuery(theme.breakpoints.between("xs", "sm"));
  const isXSOnly = useMediaQuery(theme.breakpoints.only("xs"));
  const isSMONly = useMediaQuery(theme.breakpoints.only("sm"));
  const [dlgDevices, setDlgDevices] = useState(false);

  const [boxHeight, setBoxHeight] = useState(0);
  const boxRef = useRef();

  const { width: windowWidth } = useWindowSize();

  useEffect(() => {
    if (boxRef.current && boxRef.current.offsetHeight !== boxHeight) {
      setBoxHeight(boxRef.current.offsetHeight);
    }
  }, [windowWidth]);

  const handleSetting = (event, n) => {
    setSetting(n);
  };

  const handleClose = () => {
    onClose();
  };

  const internalPadding = useResponsiveSize({
    xl: 3,
    lg: 5,
    md: 2,
    sm: 2,
    xs: 2,
  });

  return (
    <ThemeProvider theme={theme}>
      <Grid container>
        <Box>
          <Dialog onClose={handleClose} open={open} maxWidth={"xl"}>
            <Box
              p={internalPadding}
              style={{
                width: isXSOnly ? "100vw" : isSMONly ? "50vw" : "55vw",
                display: "flex",
                flex: 1,
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "4px",
                backgroundColor: theme.palette.darkTheme.slightLighter,
              }}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box position={"absolute"} top={0} right={0}>
                  <IconButton
                    onClick={() => {
                      handleClose();
                    }}
                  >
                    <CloseIcon></CloseIcon>
                  </IconButton>
                </Box>
                <Typography
                  variant="h5"
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  Settings
                </Typography>
              </Box>
              <Box
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box mt={5}>
                  <Box>
                    {[
                      { value: "audio", label: "Audio" },
                      { value: "video", label: "Video" },
                    ].map(({ value, label }) =>
                      label === "Audio" || label === "Video" ? (
                        <Button
                          classes={{
                            root:
                              setting === value
                                ? classes.buttonLight
                                : undefined,
                          }}
                          style={{
                            borderRadius: 0,
                            color: "white",
                            borderColor: "white",
                          }}
                          variant={setting === value ? "contained" : "outlined"}
                          disableElevation
                          disableRipple
                          color={setting === value ? "primary" : "white"}
                          size={"large"}
                          onClick={() => {
                            handleSetting(null, value);
                          }}
                        >
                          {label}
                        </Button>
                      ) : null
                    )}
                  </Box>
                </Box>
              </Box>
              {setting === "audio" ? (
                <Box ref={boxRef}>
                  <Box style={{ width: "100%" }}>
                    <Grid
                      spacing={3}
                      container
                      style={{
                        display: "flex",
                        flexDirection: isXSOnly ? "column-reverse" : "row",
                      }}
                    >
                      <Grid item xs={12} md={7}>
                        <Box>
                          <Box
                            style={{ display: "flex", flexDirection: "column" }}
                            mt={isXStoSM ? 0 : 3}
                          >
                            <Box ml={2}>
                              <Typography
                                variant="subtitle1"
                                style={{
                                  fontWeight: "bold",
                                }}
                              >
                                Microphone
                              </Typography>
                            </Box>

                            <FormControl
                              style={{ width: "100%", marginTop: 8 }}
                            >
                              <Select
                                fullWidth
                                variant="outlined"
                                value={audioTrack?.getSettings()?.deviceId}
                                MenuProps={{
                                  classes: {
                                    paper: classes.paperDark,
                                  },
                                }}
                                classes={{
                                  icon: classes.selectIcon,
                                }}
                                style={{
                                  border: `1px solid ${"white"}`,
                                }}
                                onChange={(e) => {
                                  changeMic(e.target.value);
                                }}
                              >
                                {mics?.map((item, index) => {
                                  return item?.kind === "audioinput" ? (
                                    <MenuItem
                                      value={item?.deviceId}
                                      onClick={(e) => {
                                        setSelectedMic((s) => ({
                                          ...s,
                                          id: item?.deviceId,
                                        }));
                                      }}
                                    >
                                      {item?.label
                                        ? item?.label
                                        : `Mic ${index + 1}`}
                                    </MenuItem>
                                  ) : null;
                                })}
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Box
                          style={{ position: "relative" }}
                          mt={isXStoSM ? 0 : 5}
                          p={2}
                        >
                          <Box
                            style={{
                              flex: 1,
                              display: "flex",
                              width: isXStoSM ? "50%" : "100%",
                              height: isXStoSM ? "50%" : undefined,
                              paddingTop: !isXSOnly ? "56.25%" : "auto",
                              position: "relative",
                              borderRadius: theme.spacing(1 / 4),
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              style={{
                                position: !isXSOnly ? "absolute" : "unset",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                alignItems: "flex-start",
                                flexDirection: "column",
                                borderRadius: theme.spacing(1),
                                overflow: "hidden",
                              }}
                            >
                              <AudioAnalyser audioTrack={audioTrack} />
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              ) : setting === "video" ? (
                <Box ref={boxRef}>
                  <Box style={{ width: "100%" }}>
                    <Grid
                      spacing={3}
                      container
                      style={{
                        display: "flex",
                        flexDirection: isXSOnly ? "column-reverse" : "row",
                      }}
                    >
                      <Grid item xs={12} md={7}>
                        <Box>
                          <Box
                            style={{ display: "flex", flexDirection: "column" }}
                            mt={isXStoSM ? 0 : 3}
                          >
                            <Box ml={2}>
                              <Typography
                                variant="subtitle1"
                                style={{
                                  fontWeight: "bold",
                                }}
                              >
                                Camera
                              </Typography>
                            </Box>
                            <FormControl
                              style={{ width: "100%", marginTop: 8 }}
                            >
                              <Select
                                fullWidth
                                variant="outlined"
                                value={videoTrack?.getSettings()?.deviceId}
                                onChange={(e) => {
                                  changeWebcam(e.target.value);
                                }}
                                MenuProps={{
                                  classes: {
                                    paper: classes.paperDark,
                                  },
                                }}
                                classes={{
                                  icon: classes.selectIcon,
                                }}
                                style={{
                                  border: `1px solid ${"white"}`,
                                }}
                              >
                                {webcams?.map((item, index) => {
                                  return item?.kind === "videoinput" ? (
                                    <MenuItem
                                      value={item?.deviceId}
                                      onClick={() => {
                                        setSelectedWebcam((s) => ({
                                          ...s,
                                          id: item?.deviceId,
                                        }));
                                      }}
                                    >
                                      {item?.label === ""
                                        ? `Webcam ${index + 1}`
                                        : item?.label}
                                    </MenuItem>
                                  ) : null;
                                })}
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Box
                          style={{ position: "relative" }}
                          mt={isXStoSM ? 0 : 5}
                          p={2}
                        >
                          <Box
                            style={{
                              flex: 1,
                              display: "flex",
                              width: isXStoSM ? "50%" : "100%",
                              height: isXStoSM ? "50%" : undefined,
                              paddingTop: !isXSOnly ? "56.25%" : "auto",
                              position: "relative",
                              borderRadius: theme.spacing(1 / 4),
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              style={{
                                position: !isXSOnly ? "absolute" : "unset",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: theme.palette.primary.light,
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: theme.spacing(1),
                                overflow: "hidden",
                              }}
                            >
                              <video
                                autoPlay
                                playsInline
                                muted
                                ref={popupVideoPlayerRef}
                                controls={false}
                                className={classes.video + " flip"}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Dialog>

          <ConfirmBox
            open={dlgDevices}
            title="Mic or webcam not available"
            subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
            successText="DISMISS"
            onSuccess={() => {
              setDlgDevices(false);
            }}
          />
        </Box>
      </Grid>
    </ThemeProvider>
  );
}
