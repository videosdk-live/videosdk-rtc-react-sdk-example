import React from "react";
import { useMediaQuery } from "react-responsive";
import useIsMobile from "../../../hooks/useIsMobile";
import useIsTab from "../../../hooks/useIsTab";
import PlayerViewer from "./PlayerViewer";

const MotionPlayer = () => {
  return (
    <div style={{ height: `100%`, width: `100%` }}>
      <PlayerViewer />
    </div>
  );
};

export const MemoizedMotionPlayer = React.memo(MotionPlayer);

const HLSContainer = ({ width }) => {
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const rowSpacing = isMobile
    ? 12
    : isTab
    ? 14
    : isLGDesktop
    ? 16
    : isXLDesktop
    ? 24
    : 0;

  const gutter = 4;

  const spacing = rowSpacing - gutter;

  return (
    <div
      style={{
        height: `calc(100% - ${2 * spacing}px)`,
        width: width - 2 * spacing,
        margin: spacing,
        transition: `all ${800 * 1}ms`,
        transitionTimingFunction: "ease-in-out",
        position: "relative",
      }}
    >
      <MemoizedMotionPlayer />
    </div>
  );
};

export default HLSContainer;
