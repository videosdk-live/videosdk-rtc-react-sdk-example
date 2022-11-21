import {
  Constants,
  createCameraVideoTrack,
  useMeeting,
  usePubSub,
} from "@videosdk.live/react-sdk";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/outline";
import recordingBlink from "../../animations/recording-blink.json";
import liveHLS from "../../animations/live-hls.json";
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
import { OutlinedButton } from "../../components/buttons/OutlinedButton";
import {
  Box,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  MenuList,
  Popover,
  SwipeableDrawer,
  Tooltip,
  Typography,
  useTheme,
} from "@material-ui/core";
import {
  ArrowDropDown as ArrowDropDownIcon,
  MoreHoriz as MoreHorizIcon,
} from "@material-ui/icons";
import useIsTab from "../../hooks/useIsTab";
import useIsMobile from "../../hooks/useIsMobile";
import { MobileIconButton } from "../../components/buttons/MobileIconButton";
import PollIcon from "../../icons/Bottombar/PollIcon";
import useIsHls from "../../hooks/useIsHls";
import LiveIcon from "../../icons/LiveIcon";
import ReactionIcon from "../../icons/Bottombar/ReactionIcon";
import { sideBarModes } from "../../utils/common";
import ECommerceIcon from "../../icons/Bottombar/ECommerceIcon";

const useStyles = makeStyles({
  popoverHoverDark: {
    "&:hover": {
      backgroundColor: "#2B303499",
    },
  },

  menuItemDark: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  menuItemGutters: {
    padding: "6px 12px",
  },
});
export function ILSBottomBar({
  bottomBarHeight,
  sideBarMode,
  setSideBarMode,
  setIsMeetingLeft,
  selectWebcamDeviceId,
  setSelectWebcamDeviceId,
  selectMicDeviceId,
  setSelectMicDeviceId,
  meetingMode,
}) {
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

  const SingleMicMenu = ({
    micArr,
    label,
    classes,
    changeMic,
    handleClose,
  }) => {
    const theme = useTheme();
    return (
      <Box>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            padding: 12,
            paddingBottom: 0,
          }}
        >
          <Typography
            style={{
              marginLeft: 12,
              fontSize: 14,
              color: theme.palette.darkTheme.contrastText,
            }}
          >
            {label}
          </Typography>
        </Box>
        <MenuList
          disableRipple
          disableFocusRipple
          style={{
            backgroundColor: theme.palette.darkTheme.slightLighter,
            color: theme.palette.common.white,
          }}
        >
          {micArr.map(({ deviceId, label }, index) => (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: 12,
                paddingRight: 12,
                backgroundColor: deviceId === selectMicDeviceId && "#3F4046",
              }}
              classes={{
                root: classes.popoverHoverDark,
              }}
            >
              <MenuItem
                disableRipple
                style={{
                  display: "flex",
                  flex: 1,
                  backgroundColor: deviceId === selectMicDeviceId && "#3F4046",
                }}
                key={`mics_${deviceId}`}
                selected={deviceId === selectMicDeviceId}
                onClick={() => {
                  handleClose();
                  setSelectMicDeviceId(deviceId);
                  changeMic(deviceId);
                }}
                classes={{
                  root: classes.menuItemDark,
                  gutters: classes.menuItemGutters,
                }}
              >
                {label || `Mic ${index + 1}`}
              </MenuItem>
            </Box>
          ))}
        </MenuList>
      </Box>
    );
  };

  const MicMenu = ({
    downArrow,
    mics,
    classes,
    handleClose,
    tollTipEl,
    changeMic,
  }) => {
    const theme = useTheme();

    return (
      <Popover
        container={tollTipEl.current}
        anchorOrigin={{
          vertical: isMobile || isTab ? "bottom" : "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: isMobile || isTab ? "top" : "bottom",
          horizontal: "center",
        }}
        anchorEl={tollTipEl.current}
        open={Boolean(downArrow)}
        onClose={handleClose}
      >
        <Box
          style={{
            backgroundColor: theme.palette.darkTheme.slightLighter,
          }}
        >
          <SingleMicMenu
            micArr={mics}
            label={"MICROPHONE"}
            changeMic={changeMic}
            classes={classes}
            handleClose={handleClose}
          />
        </Box>
      </Popover>
    );
  };

  const MicBTN = () => {
    const mMeeting = useMeeting();
    const [mics, setMics] = useState([]);
    const [downArrow, setDownArrow] = useState(false);
    const localMicOn = mMeeting?.localMicOn;
    const changeMic = mMeeting?.changeMic;
    const classes = useStyles();

    const getMics = async (mGetMics) => {
      const mics = await mGetMics();

      mics && mics?.length && setMics(mics);
    };

    const handleClick = (event) => {
      setDownArrow(event.currentTarget);
    };

    const handleClose = () => {
      setDownArrow(null);
    };

    return (
      <>
        <OutlinedButton
          Icon={localMicOn ? MicOnIcon : MicOffIcon}
          onClick={() => {
            mMeeting.toggleMic();
          }}
          bgColor={localMicOn ? "bg-gray-750" : "bg-white"}
          borderColor={localMicOn && "#ffffff33"}
          isFocused={localMicOn}
          focusIconColor={localMicOn && "white"}
          tooltip={"Toggle Mic"}
          renderRightComponent={() => {
            return (
              <Tooltip placement="bottom" title={"Change microphone"}>
                <IconButton
                  onClick={(e) => {
                    getMics(mMeeting.getMics);
                    handleClick(e);
                  }}
                  size={"small"}
                >
                  <ArrowDropDownIcon
                    fontSize={"small"}
                    style={{
                      color: mMeeting.localMicOn ? "white" : "black",
                    }}
                  />
                </IconButton>
              </Tooltip>
            );
          }}
        />
        <MicMenu
          downArrow={downArrow}
          tollTipEl={tollTipEl}
          changeMic={changeMic}
          mics={mics}
          classes={classes}
          handleClose={handleClose}
        />
      </>
    );
  };

  const WebCamBTN = () => {
    const mMeeting = useMeeting();
    const [webcams, setWebcams] = useState([]);
    const [webcamDownArrow, setDownArrowWebCam] = useState(false);
    const localWebcamOn = mMeeting?.localWebcamOn;
    const changeWebcam = mMeeting?.changeWebcam;
    const classes = useStyles();
    const theme = useTheme();
    const getWebcams = async (mGetWebcams) => {
      const webcams = await mGetWebcams();

      webcams && webcams?.length && setWebcams(webcams);
    };

    const handleClickWebCam = (event) => {
      setDownArrowWebCam(event.currentTarget);
    };

    const handleCloseWebCam = () => {
      setDownArrowWebCam(null);
    };

    return (
      <>
        <OutlinedButton
          Icon={localWebcamOn ? WebcamOnIcon : WebcamOffIcon}
          onClick={async () => {
            const track = await createCameraVideoTrack({
              optimizationMode: "motion",
              encoderConfig: "h720p_w1280p",
              facingMode: "environment",
              multiStream: false,
            });
            mMeeting.toggleWebcam(track);
          }}
          bgColor={localWebcamOn ? "bg-gray-750" : "bg-white"}
          borderColor={localWebcamOn && "#ffffff33"}
          isFocused={localWebcamOn}
          focusIconColor={localWebcamOn && "white"}
          tooltip={"Toggle Webcam"}
          renderRightComponent={() => {
            return (
              <Tooltip placement="bottom" title={"Change webcam"}>
                <IconButton
                  onClick={(e) => {
                    getWebcams(mMeeting?.getWebcams);
                    handleClickWebCam(e);
                  }}
                  size={"small"}
                >
                  <ArrowDropDownIcon
                    fontSize={"small"}
                    style={{
                      color: localWebcamOn ? "white" : "black",
                    }}
                  />
                </IconButton>
              </Tooltip>
            );
          }}
        />
        <Popover
          container={tollTipEl.current}
          anchorOrigin={{
            vertical: isMobile || isTab ? "bottom" : "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: isMobile || isTab ? "top" : "bottom",
            horizontal: "center",
          }}
          anchorEl={tollTipEl.current}
          open={Boolean(webcamDownArrow)}
          onClose={handleCloseWebCam}
        >
          <MenuList
            style={{
              backgroundColor: theme.palette.darkTheme.slightLighter,
              color: theme.palette.common.white,
            }}
          >
            {webcams.map(({ deviceId, label }, index) => (
              <MenuItem
                key={`output_webcams_${deviceId}`}
                selected={deviceId === selectWebcamDeviceId}
                onClick={async () => {
                  handleCloseWebCam();
                  setSelectWebcamDeviceId(deviceId);
                  const track = await createCameraVideoTrack({
                    optimizationMode: "motion",
                    encoderConfig: "h720p_w1280p",
                    facingMode: "environment",
                    multiStream: false,
                    cameraId: deviceId,
                  });
                  changeWebcam(track);
                }}
                classes={{
                  root: classes.popoverHoverDark,
                }}
              >
                {label || `Webcam ${index + 1}`}
              </MenuItem>
            ))}
          </MenuList>
        </Popover>
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

  const LeaveBTN = () => {
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
        disabled={meetingMode === Constants.modes.VIEWER}
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
        disabled={meetingMode === Constants.modes.VIEWER}
      />
    );
  };

  const PollBTN = ({ isMobile, isTab }) => {
    return isMobile || isTab ? (
      <MobileIconButton
        id="poll-btn"
        tooltipTitle={"Poll"}
        buttonText={"Poll"}
        isFocused={sideBarMode === sideBarModes.POLLS}
        Icon={PollIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.POLLS ? null : sideBarModes.POLLS
          );
        }}
      />
    ) : (
      <OutlinedButton
        Icon={PollIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.POLLS ? null : sideBarModes.POLLS
          );
        }}
        isFocused={sideBarMode === sideBarModes.POLLS}
        tooltip={"Poll"}
      />
    );
  };

  const HLSBTN = ({ isMobile, isTab }) => {
    const { startHls, stopHls, hlsState } = useMeeting({});

    const isHls = useIsHls();

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          hlsState === Constants.hlsEvents.HLS_STARTING ||
          hlsState === Constants.hlsEvents.HLS_STOPPING,
      }),
      [hlsState]
    );

    const { type, priority, gridSize } = useMemo(
      () => ({
        type: "SPOTLIGHT",
        priority: "PIN",
        gridSize: "12",
      }),
      []
    );

    const typeRef = useRef(type);
    const priorityRef = useRef(priority);
    const gridSizeRef = useRef(gridSize);
    const isHlsRef = useRef(isHls);

    useEffect(() => {
      typeRef.current = type;
    }, [type]);

    useEffect(() => {
      priorityRef.current = priority;
    }, [priority]);

    useEffect(() => {
      gridSizeRef.current = gridSize;
    }, [gridSize]);

    useEffect(() => {
      isHlsRef.current = isHls;
    }, [isHls]);

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: liveHLS,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
      height: 64,
      width: 170,
    };

    const _handleStartHLS = () => {
      const type = typeRef.current;
      const priority = priorityRef.current;
      const gridSize = gridSizeRef.current;

      const layout = { type, priority, gridSize };

      startHls({ layout, theme: "DARK" });
    };

    const _handleClick = () => {
      const isHls = isHlsRef.current;

      if (isHls) {
        stopHls();
      } else {
        _handleStartHLS();
      }
    };

    return isMobile || isTab ? (
      <MobileIconButton
        onClick={_handleClick}
        tooltipTitle={
          hlsState === Constants.hlsEvents.HLS_STARTED
            ? "Stop HLS"
            : hlsState === Constants.hlsEvents.HLS_STARTING
            ? "Starting HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPED
            ? "Start HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPING
            ? "Stopping HLS"
            : "Start HLS"
        }
        Icon={LiveIcon}
        buttonText={
          hlsState === Constants.hlsEvents.HLS_STARTED
            ? "Stop HLS"
            : hlsState === Constants.hlsEvents.HLS_STARTING
            ? "Starting HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPED
            ? "Start HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPING
            ? "Stopping HLS"
            : "Start HLS"
        }
        isFocused={isHls}
        lottieOption={isHls ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    ) : null;
  };

  const ReactionBTN = ({ isMobile, isTab }) => {
    const [btnClicked, setBtnClicked] = useState(false);
    const { publish } = usePubSub("REACTION");

    const handleOpenMenu = (event) => {
      setBtnClicked(event.currentTarget);
    };

    const handleCloseMenu = () => {
      setBtnClicked(null);
    };

    function sendEmoji(emoji) {
      // Dispatch custom event here so the local user can see their own emoji
      window.dispatchEvent(
        new CustomEvent("reaction_added", { detail: { emoji } })
      );
      handleCloseMenu();
    }

    const emojiArray = [
      { emoji: "😍", emojiName: "heartEye" },
      { emoji: "😂", emojiName: "laugh" },
      { emoji: "👍", emojiName: "thumbsup" },
      { emoji: "🎉", emojiName: "confetti" },
      { emoji: "👏", emojiName: "clap" },
      { emoji: "❤️", emojiName: "heart" },
    ];

    return (
      <>
        <OutlinedButton
          Icon={ReactionIcon}
          onClick={(e) => {
            handleOpenMenu(e);
          }}
          isFocused={btnClicked}
          tooltip={"Reactions"}
        />
        <Popover
          container={tollTipEl.current}
          anchorOrigin={{
            vertical: isMobile || isTab ? "bottom" : "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: isMobile || isTab ? "top" : "bottom",
            horizontal: "center",
          }}
          anchorEl={tollTipEl.current}
          open={Boolean(btnClicked)}
          onClose={handleCloseMenu}
        >
          <div className="px-1 py-2 bg-white rounded-md">
            {emojiArray.map(({ emoji, emojiName }) => (
              <button
                key={`reaction-${emojiName}`}
                className="mx-2"
                onClick={() => {
                  sendEmoji(emojiName);
                  publish(emojiName);
                }}
              >
                <p className="text-3xl">{emoji}</p>
              </button>
            ))}
          </div>
        </Popover>
      </>
    );
  };

  const ECommerceBTN = ({ isMobile, isTab }) => {
    return isMobile || isTab ? (
      <MobileIconButton
        id="ecommerce-btn"
        tooltipTitle={"Ecommerce"}
        buttonText={"Ecommerce"}
        isFocused={sideBarMode === sideBarModes.ECOMMERCE}
        Icon={ECommerceIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.ECOMMERCE ? null : sideBarModes.ECOMMERCE
          );
        }}
      />
    ) : (
      <OutlinedButton
        Icon={ECommerceIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.ECOMMERCE ? null : sideBarModes.ECOMMERCE
          );
        }}
        isFocused={sideBarMode === sideBarModes.ECOMMERCE}
        tooltip={"Ecommerce"}
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
      MEETING_ID_COPY: "MEETING_ID_COPY",
      HLS: "HLS",
      POLL: "POLL",
      REACTION: "REACTION",
      ECOMMERCE: "ECOMMERCE",
    }),
    []
  );

  const otherFeatures = [
    { icon: BottomBarButtonTypes.RAISE_HAND },
    { icon: BottomBarButtonTypes.CHAT },
    { icon: BottomBarButtonTypes.PARTICIPANTS },
    { icon: BottomBarButtonTypes.MEETING_ID_COPY },
    { icon: BottomBarButtonTypes.POLL },
    { icon: BottomBarButtonTypes.REACTION },
    { icon: BottomBarButtonTypes.ECOMMERCE },
  ];

  if (meetingMode === Constants.modes.CONFERENCE) {
    otherFeatures.pop({ icon: BottomBarButtonTypes.REACTION });
    otherFeatures.push({ icon: BottomBarButtonTypes.SCREEN_SHARE });
    otherFeatures.push({ icon: BottomBarButtonTypes.HLS });
  }

  return isMobile || isTab ? (
    <div
      className="flex items-center justify-center"
      style={{ height: bottomBarHeight }}
    >
      <LeaveBTN />
      <MicBTN />
      <WebCamBTN />
      <RecordingBTN />
      <OutlinedButton Icon={MoreHorizIcon} onClick={handleClickFAB} />
      <SwipeableDrawer
        anchor={"bottom"}
        open={Boolean(open)}
        onClose={handleCloseFAB}
        onOpen={handleClickFAB}
        style={{ paddingBottom: "100px" }}
      >
        <Grid container className="bg-gray-800 py-6">
          {otherFeatures.map(({ icon }) => {
            return (
              <Grid
                className="flex items-center justify-center"
                item
                xs={icon === BottomBarButtonTypes.MEETING_ID_COPY ? 7 : 4}
                sm={icon === BottomBarButtonTypes.MEETING_ID_COPY ? 5 : 3}
                md={icon === BottomBarButtonTypes.MEETING_ID_COPY ? 3 : 2}
              >
                {icon === BottomBarButtonTypes.RAISE_HAND ? (
                  <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.SCREEN_SHARE ? (
                  <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.CHAT ? (
                  <ChatBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.PARTICIPANTS ? (
                  <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.MEETING_ID_COPY ? (
                  <MeetingIdCopyBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.HLS ? (
                  <HLSBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.POLL ? (
                  <PollBTN isMobile={isMobile} isTab={isTab} />
                ) : icon === BottomBarButtonTypes.REACTION &&
                  meetingMode === Constants.modes.VIEWER ? (
                  <ReactionBTN isMobile={isMobile} isTab={isTab} />
                ) : meetingMode === Constants.modes.VIEWER ? (
                  <ECommerceBTN isMobile={isMobile} isTab={isTab} />
                ) : null}
              </Grid>
            );
          })}
        </Grid>
      </SwipeableDrawer>
    </div>
  ) : (
    <div className="md:flex lg:px-2 xl:px-6 pb-2 px-2 hidden">
      <MeetingIdCopyBTN />

      <div className="flex flex-1 items-center justify-center" ref={tollTipEl}>
        {meetingMode === Constants.modes.CONFERENCE && (
          <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
        )}
        <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
        {meetingMode === Constants.modes.VIEWER && (
          <ReactionBTN isMobile={isMobile} isTab={isTab} />
        )}
        {meetingMode === Constants.modes.CONFERENCE && (
          <>
            <MicBTN />
            <WebCamBTN />
          </>
        )}
        <LeaveBTN />
      </div>
      <div className="flex items-center justify-center">
        {meetingMode === Constants.modes.VIEWER && (
          <ECommerceBTN isMobile={isMobile} isTab={isTab} />
        )}
        <PollBTN isMobile={isMobile} isTab={isTab} />
        <ChatBTN isMobile={isMobile} isTab={isTab} />
        <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
      </div>
    </div>
  );
}
