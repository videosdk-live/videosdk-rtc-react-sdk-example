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
import { Constants, useMeeting } from "@videosdk.live/react-sdk";
import React from "react";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";
import useResponsiveSize from "../../hooks/useResponsiveSize";
import ECommercePanel from "../../interactive-live-streaming/components/ECommercePanel";
import CreatePoll from "../../interactive-live-streaming/components/pollContainer/CreatePoll";
import PollList from "../../interactive-live-streaming/components/pollContainer/PollList";
import SubmitPollList from "../../interactive-live-streaming/components/pollContainer/SubmitPollList";
import { sideBarModes } from "../../utils/common";

import { ChatPanel } from "./ChatPanel";
import { ParticipantPanel } from "./ParticipantPanel";

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
  meetingMode,
  polls,
  draftPolls,
  setSideBarMode,
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
                    : sideBarMode === sideBarModes.CREATE_POLL
                    ? "Create a poll"
                    : sideBarMode === sideBarModes.POLLS
                    ? polls?.length >= 1 || draftPolls?.length >= 1
                      ? `Polls ${
                          polls?.length || draftPolls?.length
                            ? `(${polls?.length || draftPolls?.length})`
                            : ""
                        }`
                      : meetingMode === Constants.modes.VIEWER
                      ? `Polls ${polls?.length ? `(${polls?.length})` : ""}`
                      : "Create a poll"
                    : sideBarMode === sideBarModes.ECOMMERCE
                    ? "Products"
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
              <ParticipantPanel
                panelHeight={panelHeight}
                raisedHandsParticipants={raisedHandsParticipants}
              />
            ) : sideBarMode === "CHAT" ? (
              <ChatPanel panelHeight={panelHeight} />
            ) : sideBarMode === "POLLS" && meetingMode !== "VIEWER" ? (
              polls.length === 0 && draftPolls.length === 0 ? (
                <CreatePoll {...{ panelHeight, polls }} />
              ) : (
                <PollList
                  {...{ panelHeight, polls, draftPolls, setSideBarMode }}
                />
              )
            ) : sideBarMode === "POLLS" && meetingMode === "VIEWER" ? (
              <SubmitPollList {...{ panelHeight, polls }} />
            ) : sideBarMode === "CREATE_POLL" ? (
              <CreatePoll {...{ panelHeight, polls, setSideBarMode }} />
            ) : sideBarMode === "ECOMMERCE" ? (
              <ECommercePanel {...{ panelHeight, setSideBarMode }} />
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
  sideBarContainerWidth,
  sideBarMode,
  setSideBarMode,
  raisedHandsParticipants,
  meetingMode,
  polls,
  draftPolls,
}) {
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
          polls={polls}
          draftPolls={draftPolls}
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
        meetingMode={meetingMode}
        polls={polls}
        draftPolls={draftPolls}
        setSideBarMode={setSideBarMode}
      />
    )
  ) : (
    <></>
  );
}
