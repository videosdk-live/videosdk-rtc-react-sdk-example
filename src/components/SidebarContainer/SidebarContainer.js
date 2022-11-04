import {
  Box,
  capitalize,
  IconButton,
  Typography,
  useTheme,
  Fade,
  Dialog,
  Slide,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { useMeeting } from "@videosdk.live/react-sdk";
import React from "react";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";
import useResponsiveSize from "../../hooks/useResponsiveSize";
import { ChatSidePanel } from "./ChatSidePanel";
import { ParticipantSidePanel } from "./ParticipantSidePanel";

const SideBarTabView = ({
  height,
  sideBarContainerWidth,
  panelHeight,
  sideBarMode,
  raisedHandsParticipants,
  panelHeaderHeight,
  panelHeaderPadding,
  panelPadding,
  handleClose,
}) => {
  const { participants } = useMeeting();
  const theme = useTheme();

  return (
    <div
      style={{
        height,
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
            height: height,
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
                <IconButton
                  onClick={handleClose}
                  style={{ margin: 0, padding: 0 }}
                >
                  <Close fontSize={"small"} />
                </IconButton>
              </Box>
            )}
            {sideBarMode === "PARTICIPANTS" ? (
              <ParticipantSidePanel
                panelHeight={panelHeight}
                raisedHandsParticipants={raisedHandsParticipants}
              />
            ) : sideBarMode === "CHAT" ? (
              <ChatSidePanel panelHeight={panelHeight} />
            ) : null}
          </>
        </div>
      </Fade>
    </div>
  );
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export function SidebarConatiner({
  height,
  sideBarMode,
  setSideBarMode,
  raisedHandsParticipants,
}) {
  const panelPadding = 8;

  const paddedHeight = height - panelPadding * 3.5;

  const sideBarContainerWidth = useResponsiveSize({
    xl: 400,
    lg: 360,
    md: 320,
    sm: 280,
    xs: 240,
  });

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

  const isMobile = useIsMobile();
  const isTab = useIsTab();

  return sideBarMode ? (
    isTab || isMobile ? (
      <Dialog
        closeAfterTransition
        fullScreen
        open={sideBarMode}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <SideBarTabView
          height={"100%"}
          sideBarContainerWidth={"100%"}
          panelHeight={height}
          sideBarMode={sideBarMode}
          raisedHandsParticipants={raisedHandsParticipants}
          panelHeaderHeight={panelHeaderHeight}
          panelHeaderPadding={panelHeaderPadding}
          panelPadding={panelPadding}
          handleClose={handleClose}
        />
      </Dialog>
    ) : (
      <SideBarTabView
        height={paddedHeight}
        sideBarContainerWidth={sideBarContainerWidth}
        panelHeight={paddedHeight - panelHeaderHeight - panelHeaderPadding}
        sideBarMode={sideBarMode}
        raisedHandsParticipants={raisedHandsParticipants}
        panelHeaderHeight={panelHeaderHeight}
        panelHeaderPadding={panelHeaderPadding}
        panelPadding={panelPadding}
        handleClose={handleClose}
      />
    )
  ) : (
    <></>
  );
}
