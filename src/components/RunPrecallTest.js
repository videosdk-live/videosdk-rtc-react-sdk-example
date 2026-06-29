import { Popover, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import * as ReactDOM from "react-dom";
import { useMediaQuery } from "react-responsive";
import RefreshIcon from "../icons/PrecallTest/RefreshIcon";
import RefreshCheck from "../icons/PrecallTest/RefreshCheck";
import NetworkIcon from "../icons/NetworkIcon";
import { runPreCallTest } from "@videosdk.live/react-sdk";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { getToken } from "../api";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";

const NETWORK_QUALITY_PANEL_WIDTH = 440;
const METRIC_LABEL_COL_WIDTH = 120;
const METRIC_DATA_COL_WIDTH = 80;
const PANEL_VIEWPORT_MARGIN = 8;

const formatMs = (v) => (v == null ? "-" : `${Math.round(v)} ms`);
const formatPercent = (v) => (v == null ? "-" : `${v.toFixed(2)}%`);
const formatKbps = (bps) => (bps == null ? "-" : `${Math.round(bps / 1000)} kb/s`);
const formatFps = (v) => (v == null ? "-" : `${Math.round(v)}`);

const overallQuality = (networkQuality) => {
  if (!networkQuality) return 0;
  const uplinkQuality = networkQuality.uplink?.quality ?? 0;
  const downlinkQuality = networkQuality.downlink?.quality ?? 0;
  if (!uplinkQuality && !downlinkQuality) return 0;
  if (!uplinkQuality) return downlinkQuality;
  if (!downlinkQuality) return uplinkQuality;
  return Math.min(uplinkQuality, downlinkQuality);
};

const StatsPanelPositioner = ({ buttonRef, children }) => {
  const [panelEl, setPanelEl] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : NETWORK_QUALITY_PANEL_WIDTH
  );

  const updateButtonRect = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setButtonRect({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });
  }, [buttonRef]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      updateButtonRect();
    };
    updateButtonRect();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateButtonRect, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateButtonRect, true);
    };
  }, [updateButtonRect]);

  useLayoutEffect(() => {
    if (!panelEl) return;
    const measureHeight = () => setPanelHeight(panelEl.offsetHeight);
    measureHeight();
    const resizeObserver = new ResizeObserver(measureHeight);
    resizeObserver.observe(panelEl);
    return () => resizeObserver.disconnect();
  }, [panelEl]);

  const effectivePanelWidth = Math.min(
    NETWORK_QUALITY_PANEL_WIDTH,
    viewportWidth - PANEL_VIEWPORT_MARGIN * 2
  );

  const positionStyle = (() => {
    if (!buttonRect) {
      return { top: -9999, left: -9999, visibility: "hidden" };
    }

    const leftIfRightAnchored = buttonRect.right - effectivePanelWidth;
    const horizontal =
      leftIfRightAnchored < PANEL_VIEWPORT_MARGIN
        ? { left: PANEL_VIEWPORT_MARGIN, right: "auto" }
        : {
            right: Math.max(PANEL_VIEWPORT_MARGIN, viewportWidth - buttonRect.right),
            left: "auto",
          };

    const vertical =
      panelHeight === 0
        ? { top: buttonRect.top, visibility: "hidden" }
        : { top: Math.max(PANEL_VIEWPORT_MARGIN, buttonRect.top) };

    return { ...horizontal, ...vertical };
  })();

  return (
    <div
      ref={setPanelEl}
      style={{
        position: "fixed",
        width: effectivePanelWidth,
        zIndex: 999,
        ...positionStyle,
      }}
    >
      {children}
    </div>
  );
};

const QUALITY_BG = {
  5: "#3BA55D",
  4: "#7BC96F",
  3: "#faa713",
  2: "#FF8A4C",
  1: "#FF5D5D",
};
const QUALITY_LABEL = {
  5: "Excellent",
  4: "Good",
  3: "Fair",
  2: "Poor",
  1: "Bad",
};

const RunPrecallTest = ({ videoStream, audioStream }) => {
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const analyzerSize = isXLDesktop
    ? 32
    : isLGDesktop
      ? 28
      : isTab
        ? 24
        : isMobile
          ? 20
          : 18;

  const [status, setStatus] = useState("ready");
  const [networkQuality, setNetworkQuality] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const hasRunInitial = useRef(false);
  const inFlight = useRef(false);
  const finalReceivedRef = useRef(false);
  const mountedRef = useRef(true);

  const buttonRef = useRef(null);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const runTest = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("running");
    setErrorMsg(null);
    setNetworkQuality(null);
    finalReceivedRef.current = false;
    try {
      const token = await getToken();
      if (!token) {
        if (mountedRef.current) {
          setErrorMsg("Missing token");
          setStatus("error");
        }
        return;
      }
      const result = await runPreCallTest({
        token,
        videoTrack: videoStream,
        audioTrack: audioStream,
        onStatsChange: (stats) => {
          if (finalReceivedRef.current || !mountedRef.current) return;
          setNetworkQuality(stats);
        },
      });
      if (mountedRef.current) {
        finalReceivedRef.current = true;
        setNetworkQuality(result.networkQuality);
        setStatus("ready");
      }
    } catch (err) {
      if (mountedRef.current) {
        setErrorMsg(err?.message || "Test failed");
        setStatus("error");
      }
    } finally {
      inFlight.current = false;
    }
  }, [videoStream, audioStream]);

  useEffect(() => {
    if (hasRunInitial.current) return;
    if (videoStream || audioStream) {
      hasRunInitial.current = true;
      runTest();
    }
  }, [videoStream, audioStream, runTest]);

  const overall = overallQuality(networkQuality);
  const overallBg = QUALITY_BG[overall] || "#3F4346";
  const overallLabel = QUALITY_LABEL[overall] || "—";

  const uplinkStats = networkQuality?.uplink;
  const downlinkStats = networkQuality?.downlink;

  const metricRows = [
    {
      label: "Latency",
      cells: [
        formatMs(uplinkStats?.video?.rtt),
        formatMs(uplinkStats?.audio?.rtt),
        formatMs(downlinkStats?.video?.rtt),
        formatMs(downlinkStats?.audio?.rtt),
      ],
    },
    {
      label: "Jitter",
      cells: [
        formatMs(uplinkStats?.video?.jitter),
        formatMs(uplinkStats?.audio?.jitter),
        formatMs(downlinkStats?.video?.jitter),
        formatMs(downlinkStats?.audio?.jitter),
      ],
    },
    {
      label: "Packet Loss",
      cells: [
        formatPercent(uplinkStats?.video?.packetLoss),
        formatPercent(uplinkStats?.audio?.packetLoss),
        formatPercent(downlinkStats?.video?.packetLoss),
        formatPercent(downlinkStats?.audio?.packetLoss),
      ],
    },
    {
      label: "Bitrate",
      cells: [
        formatKbps(uplinkStats?.video?.bitrate),
        formatKbps(uplinkStats?.audio?.bitrate),
        formatKbps(downlinkStats?.video?.bitrate),
        formatKbps(downlinkStats?.audio?.bitrate),
      ],
    },
    {
      label: "Frame rate",
      cells: [
        formatFps(uplinkStats?.video?.fps),
        "-",
        formatFps(downlinkStats?.video?.fps),
        "-",
      ],
    },
    {
      label: "Resolution",
      cells: [
        uplinkStats?.video?.resolution ?? "-",
        "-",
        downlinkStats?.video?.resolution ?? "-",
        "-",
      ],
    },
  ];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="rounded-md cursor-pointer"
    >
      <Popover className="relative">
        {({ close }) => (
          <>
            <Popover.Button
              ref={buttonRef}
              aria-label={`Network quality: ${overallLabel}`}
              className={`rounded-md flex items-center justify-center p-1.5 cursor-pointer`}
              style={{ backgroundColor: overallBg }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div>
                <NetworkIcon
                  color1={"#ffffff"}
                  color2={"#ffffff"}
                  color3={"#ffffff"}
                  color4={"#ffffff"}
                  style={{
                    height: analyzerSize * 0.6,
                    width: analyzerSize * 0.6,
                  }}
                />
              </div>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel style={{ zIndex: 999 }} className="absolute">
                {ReactDOM.createPortal(
                  <StatsPanelPositioner buttonRef={buttonRef}>
                    <div
                      className="bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
                      style={{ width: "100%" }}
                    >
                      <div
                        className={`p-[9px] flex items-center justify-between rounded-t-lg`}
                        style={{ backgroundColor: overallBg }}
                      >
                        <p className="text-sm text-white font-semibold">{`Quality Score : ${overallLabel}`}</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              runTest();
                            }}
                            disabled={status === "running"}
                            className={`cursor-pointer text-white hover:bg-[#ffffff33] rounded-full p-1 ${
                              status === "running"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            title="Re-run test"
                          >
                            {status === "running" ? (
                              <RefreshCheck />
                            ) : (
                              <RefreshIcon />
                            )}
                          </button>
                          <button
                            className="cursor-pointer text-white hover:bg-[#ffffff33] rounded-full px-1 text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              close();
                            }}
                          >
                            <XMarkIcon
                              className="text-white"
                              style={{ height: 16, width: 16 }}
                            />
                          </button>
                        </div>
                      </div>

                      {status === "running" && !networkQuality && (
                        <div className="px-3 py-3 text-xs text-gray-400">
                          Running pre-call test…
                        </div>
                      )}

                      {status === "error" && (
                        <div className="px-3 py-3 text-xs text-red-300">
                          {errorMsg || "Test failed."} Tap refresh to retry.
                        </div>
                      )}

                      {networkQuality && status !== "error" && (
                        <div className="flex flex-col">
                          <div
                            className="flex"
                            style={{ borderBottom: `1px solid #ffffff33` }}
                          >
                            <div style={{ width: METRIC_LABEL_COL_WIDTH }} />
                            <div
                              className="flex items-center justify-center"
                              style={{
                                width: METRIC_DATA_COL_WIDTH * 2,
                                borderLeft: `1px solid #ffffff33`,
                              }}
                            >
                              <p className="text-xs text-white my-[6px] font-medium text-center">
                                Uplink
                              </p>
                            </div>
                            <div
                              className="flex items-center justify-center"
                              style={{
                                width: METRIC_DATA_COL_WIDTH * 2,
                                borderLeft: `1px solid #ffffff33`,
                              }}
                            >
                              <p className="text-xs text-white my-[6px] font-medium text-center">
                                Downlink
                              </p>
                            </div>
                          </div>

                          <div
                            className="flex"
                            style={{ borderBottom: `1px solid #ffffff33` }}
                          >
                            <div style={{ width: METRIC_LABEL_COL_WIDTH }} />
                            {["Video", "Audio", "Video", "Audio"].map(
                              (h, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-center"
                                  style={{
                                    width: METRIC_DATA_COL_WIDTH,
                                    borderLeft: `1px solid #ffffff33`,
                                  }}
                                >
                                  <p className="text-xs text-white my-[6px] text-center">
                                    {h}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>

                          {metricRows.map((item, index) => (
                            <div
                              key={item.label}
                              className="flex"
                              style={{
                                borderBottom:
                                  index === metricRows.length - 1
                                    ? ""
                                    : `1px solid #ffffff33`,
                              }}
                            >
                              <div
                                className="flex items-center"
                                style={{ width: METRIC_LABEL_COL_WIDTH }}
                              >
                                <p className="text-xs text-white my-[6px] ml-2">
                                  {item.label}
                                </p>
                              </div>
                              {item.cells.map((cellVal, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="flex items-center justify-center"
                                  style={{
                                    width: METRIC_DATA_COL_WIDTH,
                                    borderLeft: `1px solid #ffffff33`,
                                  }}
                                >
                                  <p className="text-xs text-white my-[6px] text-center">
                                    {cellVal}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </StatsPanelPositioner>,
                  document.body,
                )}
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default RunPrecallTest;
