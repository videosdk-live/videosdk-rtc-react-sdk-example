import {
  Box,
  capitalize,
  IconButton,
  Typography,
  useTheme,
  Fade,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { useMeeting } from "@videosdk.live/react-sdk";
import React from "react";
import useResponsiveSize from "../../utils/useResponsiveSize";
import { ChatSidePanel } from "./ChatSidePanel";
import { ParticipantSidePanel } from "./ParticipantSidePanel";

export function SidebarConatiner({ height, sideBarMode, setSideBarMode }) {
  const { participants } = useMeeting();

  const sideBarContainerWidth = useResponsiveSize({
    xl: 400,
    lg: 360,
    md: 320,
    sm: 280,
    xs: 240,
  });

  const panelPadding = 8;

  const paddedHeight = height - panelPadding * 3.5;

  const panelHeaderHeight = useResponsiveSize({
    xl: 52,
    lg: 48,
    md: 44,
    sm: 40,
    xs: 36,
  });

  const panelHeaderPadding = useResponsiveSize({
    xl: 12,
    lg: 10,
    md: 8,
    sm: 6,
    xs: 4,
  });

  const handleClose = () => {
    setSideBarMode(null);
  };

  const theme = useTheme();

  return sideBarMode ? (
    <div
      style={{
        paddedHeight,
        width: sideBarContainerWidth,
        paddingTop: panelPadding,
        paddingLeft: panelPadding,
        paddingRight: panelPadding,
        paddingBottom: panelPadding,
        backgroundColor: theme.palette.darkTheme.main,
      }}
    >
      <Fade in={sideBarMode}>
        <div
          style={{
            backgroundColor: theme.palette.darkTheme.slightLighter,
            height: paddedHeight,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <>
            {sideBarMode && (
              <Box
                style={{
                  padding: panelHeaderPadding,
                  height: panelHeaderHeight - 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #70707033",
                }}
              >
                <Typography variant={"body1"} style={{ fontWeight: "bold" }}>
                  {sideBarMode === "PARTICIPANTS"
                    ? `${capitalize(
                        String(sideBarMode || "").toLowerCase()
                      )} (${new Map(participants)?.size})`
                    : capitalize(String(sideBarMode || "").toLowerCase())}
                </Typography>
                <IconButton onClick={handleClose}>
                  <Close fontSize={"small"} />
                </IconButton>
              </Box>
            )}
            {sideBarMode === "PARTICIPANTS" ? (
              <ParticipantSidePanel
                panelHeight={
                  paddedHeight - panelHeaderHeight - panelHeaderPadding
                }
              />
            ) : sideBarMode === "CHAT" ? (
              <ChatSidePanel
                panelHeight={
                  paddedHeight - panelHeaderHeight - panelHeaderPadding
                }
              />
            ) : null}
          </>
        </div>
      </Fade>
    </div>
  ) : (
    <></>
  );
}
