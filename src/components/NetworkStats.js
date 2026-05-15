import { Popover, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import * as ReactDOM from "react-dom";
import { useMediaQuery } from "react-responsive";
import RefreshIcon from "../icons/NetworkStats/RefreshIcon";
import RefreshCheck from "../icons/NetworkStats/RefreshCheck";
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

const STATS_PANEL_WIDTH = 440;
const LABEL_COL_PX = 120;
const DATA_COL_PX = 80;
const VIEWPORT_MARGIN = 8;

const fmtMs = (v) => (v == null ? "-" : `${Math.round(v)} ms`);
const fmtPct = (v) => (v == null ? "-" : `${v.toFixed(2)}%`);
const fmtKbps = (bps) => (bps == null ? "-" : `${Math.round(bps / 1000)} kb/s`);
const fmtFps = (v) => (v == null ? "-" : `${Math.round(v)}`);

const overallQuality = (nq) => {
  if (!nq) return 0;
  const u = nq.uplink?.quality ?? 0;
  const d = nq.downlink?.quality ?? 0;
  if (!u && !d) return 0;
  if (!u) return d;
  if (!d) return u;
  return Math.min(u, d);
};

const StatsPanelPositioner = ({ buttonRef, children }) => {
  const [el, setEl] = useState(null);
  const [btnRect, setBtnRect] = useState(null);
  const [panelHeight, setPanelHeight] = useState(0);

  const updateRect = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setBtnRect({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });
  }, [buttonRef]);

  useLayoutEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect]);

  useLayoutEffect(() => {
    if (!el) return;
    const measure = () => setPanelHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);

  const positionStyle = (() => {
    if (!btnRect) {
      return { top: -9999, left: -9999, visibility: "hidden" };
    }
    const vw =
      typeof window !== "undefined" ? window.innerWidth : STATS_PANEL_WIDTH;

    const leftIfRightAnchored = btnRect.right - STATS_PANEL_WIDTH;
    const horizontal =
      leftIfRightAnchored < VIEWPORT_MARGIN
        ? { left: VIEWPORT_MARGIN, right: "auto" }
        : {
            right: Math.max(VIEWPORT_MARGIN, vw - btnRect.right),
            left: "auto",
          };

    const vertical =
      panelHeight === 0
        ? { top: btnRect.top, visibility: "hidden" }
        : { top: Math.max(VIEWPORT_MARGIN, btnRect.top) };

    return { ...horizontal, ...vertical };
  })();

  return (
    <div
      ref={setEl}
      style={{
        position: "fixed",
        width: STATS_PANEL_WIDTH,
        zIndex: 999,
        ...positionStyle,
      }}
    >
      {children}
    </div>
  );
};

const NetworkStats = ({ videoStream, audioStream }) => {
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

  const buttonRef = useRef(null);

  const runTest = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("running");
    setErrorMsg(null);
    setNetworkQuality(null);
    finalReceivedRef.current = false;
    try {
      const token = await getToken();
      if (!token) {
        setErrorMsg("Missing token");
        setStatus("error");
        return;
      }
      runPreCallTest({
        token,
        videoTrack: videoStream,
        audioTrack: audioStream,
        onStatsChange: (stats) => {
          if (finalReceivedRef.current) return;
          setNetworkQuality(stats);
        },
      })
        .then((result) => {
          finalReceivedRef.current = true;
          setNetworkQuality(result.networkQuality);
          setStatus("ready");
        })
        .catch((err) => {
          setErrorMsg(err?.message || "Test failed");
          setStatus("error");
        });
    } catch (err) {
      setErrorMsg(err?.message || "Test failed");
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  };

  useEffect(() => {
    if (hasRunInitial.current) return;
    if (videoStream || audioStream) {
      hasRunInitial.current = true;
      runTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoStream, audioStream]);

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

  const overall = overallQuality(networkQuality);
  const overallBg = QUALITY_BG[overall] || "#3F4346";
  const overallLabel = QUALITY_LABEL[overall] || "—";

  const up = networkQuality?.uplink;
  const down = networkQuality?.downlink;

  const metricRows = [
    {
      label: "Latency",
      cells: [
        fmtMs(up?.video?.rtt),
        fmtMs(up?.audio?.rtt),
        fmtMs(down?.video?.rtt),
        fmtMs(down?.audio?.rtt),
      ],
    },
    {
      label: "Jitter",
      cells: [
        fmtMs(up?.video?.jitter),
        fmtMs(up?.audio?.jitter),
        fmtMs(down?.video?.jitter),
        fmtMs(down?.audio?.jitter),
      ],
    },
    {
      label: "Packet Loss",
      cells: [
        fmtPct(up?.video?.packetLoss),
        fmtPct(up?.audio?.packetLoss),
        fmtPct(down?.video?.packetLoss),
        fmtPct(down?.audio?.packetLoss),
      ],
    },
    {
      label: "Bitrate",
      cells: [
        fmtKbps(up?.video?.bitrate),
        fmtKbps(up?.audio?.bitrate),
        fmtKbps(down?.video?.bitrate),
        fmtKbps(down?.audio?.bitrate),
      ],
    },
    {
      label: "Frame rate",
      cells: [fmtFps(up?.video?.fps), "-", fmtFps(down?.video?.fps), "-"],
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
                      style={{ width: STATS_PANEL_WIDTH }}
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
                            <div style={{ width: LABEL_COL_PX }} />
                            <div
                              className="flex items-center justify-center"
                              style={{
                                width: DATA_COL_PX * 2,
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
                                width: DATA_COL_PX * 2,
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
                            <div style={{ width: LABEL_COL_PX }} />
                            {["Video", "Audio", "Video", "Audio"].map(
                              (h, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-center"
                                  style={{
                                    width: DATA_COL_PX,
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
                                style={{ width: LABEL_COL_PX }}
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
                                    width: DATA_COL_PX,
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

export default NetworkStats;
