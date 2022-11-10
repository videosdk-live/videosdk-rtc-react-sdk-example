import {
  Box,
  makeStyles,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@material-ui/core";
import {
  useMeeting,
  useParticipant,
  usePubSub,
} from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import ParticipantAddHostIcon from "../../icons/ParticipantTabPanel/ParticipantAddHostIcon";
import { meetingModes } from "../../utils/common";

const useStyles = makeStyles(() => ({
  popoverHover: {
    "&:hover": {
      backgroundColor: "#CCD2D899",
    },
  },
  popoverHoverDark: {
    "&:hover": {
      backgroundColor: "#2B303499",
    },
  },
}));
const ToggleModeContainer = ({ participantId, participantMode }) => {
  const mMeetingRef = useRef();
  const classes = useStyles();

  const [isHoverOnCohost, setIsHoverOnCohost] = useState(false);

  const mMeeting = useMeeting({});

  const { isLocal } = useParticipant(participantId);

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const { publish } = usePubSub(`CHANGE_MODE_${participantId}`, {});

  const theme = useTheme();

  return (
    !isLocal && (
      <Tooltip
        title={`${
          participantMode === meetingModes.CONFERENCE
            ? "Remove from Co-host"
            : "Add as a Co-host"
        }`}
      >
        <button
          className="flex items-center justify-center m-1 p-1 mb-2"
          onClick={(e) => {
            publish({
              mode:
                participantMode === meetingModes.CONFERENCE
                  ? meetingModes.VIEWER
                  : meetingModes.CONFERENCE,
            });
          }}
        >
          <ParticipantAddHostIcon
            fill={
              isHoverOnCohost || participantMode === meetingModes.CONFERENCE
                ? theme.palette.common.white
                : "#9E9EA7"
            }
          />
        </button>
      </Tooltip>
    )
  );

  return (
    !isLocal && (
      <MenuItem
        key={`mode_${participantId}`}
        onClick={(e) => {
          e.stopPropagation();
          publish({
            mode:
              participantMode === meetingModes.CONFERENCE
                ? meetingModes.VIEWER
                : meetingModes.CONFERENCE,
          });
        }}
        classes={{
          root: classes.popoverHoverDark,
        }}
      >
        <Box style={{ display: "flex", flexDirection: "row" }}>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ParticipantAddHostIcon
              fill={
                isHoverOnCohost || participantMode === meetingModes.CONFERENCE
                  ? theme.palette.common.white
                  : "#9E9EA7"
              }
            />
          </Box>
          <Box
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              marginLeft: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              style={{
                fontSize: 14,

                color:
                  isHoverOnCohost || participantMode === meetingModes.CONFERENCE
                    ? "#fff"
                    : theme.palette.text.secondary,
              }}
            >
              {participantMode === meetingModes.CONFERENCE
                ? "Remove from Co-host"
                : "Add as a Co-host"}
            </Typography>
          </Box>
        </Box>
      </MenuItem>
    )
  );
};

export default ToggleModeContainer;
