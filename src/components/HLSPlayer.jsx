import React, { useEffect, useRef, useState } from "react";
import { Constants } from "@videosdk.live/react-sdk";
import { useMeetingStore } from "../store/meetingStore";

const STATUS_LABELS = {
  [Constants.hlsEvents.HLS_STARTING]: "Stream is starting…",
  [Constants.hlsEvents.HLS_STARTED]: "Stream started, buffering…",
  [Constants.hlsEvents.HLS_STOPPING]: "Stream is stopping…",
  [Constants.hlsEvents.HLS_STOPPED]: "Stream has ended.",
};

function formatTime(s) {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function HLSPlayer() {
  const hlsState           = useMeetingStore((s) => s.hlsState);
  const hlsUrls            = useMeetingStore((s) => s.hlsUrls);
  const hlsPlaybackState   = useMeetingStore((s) => s.hlsPlaybackState);
  const hlsAutoplayBlocked = useMeetingStore((s) => s.hlsAutoplayBlocked);
  const hlsPlayerError     = useMeetingStore((s) => s.hlsPlayerError);
  const hlsCurrentTime     = useMeetingStore((s) => s.hlsCurrentTime);
  const hlsDuration        = useMeetingStore((s) => s.hlsDuration);
  const hlsSeekableEnd     = useMeetingStore((s) => s.hlsSeekableEnd);
  const hlsIsLive          = useMeetingStore((s) => s.hlsIsLive);

  const initHlsPlayer    = useMeetingStore((s) => s.initHlsPlayer);
  const destroyHlsPlayer = useMeetingStore((s) => s.destroyHlsPlayer);
  const hlsPlay          = useMeetingStore((s) => s.hlsPlay);
  const hlsPause         = useMeetingStore((s) => s.hlsPause);
  const hlsSeek          = useMeetingStore((s) => s.hlsSeek);
  const hlsSeekToLive    = useMeetingStore((s) => s.hlsSeekToLive);
  const hlsUnblockAutoplay = useMeetingStore((s) => s.hlsUnblockAutoplay);

  const videoRef = useRef(null);

  // Local scrub value while the user is dragging the slider
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const isPlayable = hlsState === Constants.hlsEvents.HLS_PLAYABLE;
  const url = hlsUrls?.downstreamUrl;

  useEffect(() => {
    if (!isPlayable || !url || !videoRef.current) return;
    initHlsPlayer(url, videoRef.current);
    return () => destroyHlsPlayer();
  }, [isPlayable, url]);

  const sliderMax = hlsIsLive ? hlsSeekableEnd : hlsDuration;
  const sliderValue = scrubbing ? scrubValue : hlsCurrentTime;
  const isAtLiveEdge = hlsIsLive && hlsSeekableEnd > 0 && (hlsSeekableEnd - hlsCurrentTime) < 3;

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setScrubValue(val);
  };

  const handleSliderCommit = (e) => {
    hlsSeek(Number(e.target.value));
    setScrubbing(false);
  };

  if (!isPlayable) {
    return (
      <div className="flex flex-1 items-center justify-center h-full bg-gray-800">
        <div className="flex flex-col items-center gap-3">
          {hlsState && hlsState !== Constants.hlsEvents.HLS_STOPPED && (
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          )}
          <p className="text-white text-lg text-center">
            {STATUS_LABELS[hlsState] ?? "Waiting for host to start the stream…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 items-center justify-center h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />

      {/* Autoplay blocked overlay */}
      {hlsAutoplayBlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <button
            onClick={hlsUnblockAutoplay}
            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors"
          >
            ▶ Tap to Play
          </button>
        </div>
      )}

      {/* Error toast */}
      {hlsPlayerError && (
        <div className="absolute bottom-20 left-4 right-4 bg-red-600 text-white text-sm px-3 py-2 rounded-lg">
          {hlsPlayerError}
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
        {/* Seek slider */}
        <input
          type="range"
          min={0}
          max={sliderMax || 0}
          step={0.5}
          value={sliderValue}
          onMouseDown={() => { setScrubbing(true); setScrubValue(hlsCurrentTime); }}
          onTouchStart={() => { setScrubbing(true); setScrubValue(hlsCurrentTime); }}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="w-full h-1 accent-purple-500 cursor-pointer"
        />

        <div className="flex items-center justify-between">
          {/* Play / Pause */}
          <div className="flex items-center gap-3">
            <button
              onClick={hlsPlaybackState === "playing" ? hlsPause : hlsPlay}
              className="text-white hover:text-purple-400 transition-colors text-xl leading-none"
              aria-label={hlsPlaybackState === "playing" ? "Pause" : "Play"}
            >
              {hlsPlaybackState === "playing" ? "⏸" : "▶"}
            </button>

            {/* Time */}
            {!hlsIsLive && (
              <span className="text-gray-300 text-xs tabular-nums">
                {formatTime(hlsCurrentTime)} / {formatTime(hlsDuration)}
              </span>
            )}
          </div>

          {/* Live badge */}
          {hlsIsLive && (
            <button
              onClick={hlsSeekToLive}
              className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${
                isAtLiveEdge
                  ? "bg-red-600 text-white cursor-default"
                  : "bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white"
              }`}
            >
              ● LIVE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
