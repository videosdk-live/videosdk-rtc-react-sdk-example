import React from "react";
import { Box, Typography } from "@material-ui/core";
import { useParticipant } from "@videosdk.live/react-sdk";
import { nameTructed } from "../utils/helper";

export function ParticipantView({ participantId }) {
  const {
    displayName,
    setQuality,
    webcamStream,
    webcamOn,
    micOn,
    isLocal,
    isActiveSpeaker,
    pinState,
    isPresenting,
    pin,
    unpin,
  } = useParticipant(participantId, {});

  return (
      <Typography variant="subtitle1">
        {isPresenting
          ? isLocal
            ? `You are presenting`
            : `${nameTructed(displayName, 15)} is presenting`
          : isLocal
          ? "You"
          : nameTructed(displayName, 26)}
          {console.log("Text Shown")}
      </Typography>
  );
}
