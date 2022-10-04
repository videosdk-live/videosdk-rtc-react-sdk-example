import { Box, Typography, useTheme, Avatar, Icon } from "@material-ui/core";
import { Mic, MicOff, Videocam, VideocamOff } from "@material-ui/icons";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import React from "react";
import { nameTructed } from "../../utils/helper";

function ParticipantListItem({ participantId }) {
  const { participant, micOn, webcamOn, displayName, isLocal } =
    useParticipant(participantId);

  const theme = useTheme();
  return (
    <Box
      mt={1}
      m={1}
      p={1}
      style={{
        backgroundColor: theme.palette.common.sidePanel,
        borderRadius: 6,
      }}
    >
      <Box
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Avatar variant={"rounded"}>{displayName?.charAt(0)}</Avatar>
        <Box ml={1} mr={0.5} style={{ flex: 1, display: "flex" }}>
          <Typography
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "pre-wrap",
            }}
            variant="body1"
            noWrap
          >
            {isLocal ? "You" : nameTructed(displayName, 15)}
          </Typography>
        </Box>
        <Icon
          style={{
            color: "#fff",
            marginRight: theme.spacing(1),
          }}
        >
          {micOn ? <Mic /> : <MicOff />}
        </Icon>
        <Icon
          style={{
            color: "#fff",
          }}
        >
          {webcamOn ? <Videocam /> : <VideocamOff />}
        </Icon>
      </Box>
    </Box>
  );
}

export function ParticipantSidePanel({ panelHeight }) {
  const theme = useTheme();
  const mMeeting = useMeeting();
  const participants = mMeeting.participants;
  return (
    <Box
      style={{
        height: panelHeight,
        widht: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: panelHeight - 100,
        }}
      >
        {[...participants.keys()].map((participantId) => {
          return <ParticipantListItem participantId={participantId} />;
        })}
      </Box>
    </Box>
  );
}
