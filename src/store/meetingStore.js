import { create } from "zustand";
import { devtools } from "zustand/middleware";
import Hls from "hls.js";

// Kept outside Zustand to avoid DevTools serialization errors
let _hls = null;
let _videoEl = null;

export const useMeetingStore = create(
  devtools(
    (set, get) => ({
      // ─── Meeting state (synced from useMeeting via MeetingStoreBridge) ───────
      participants: new Map(),
      localParticipant: null,
      isMeetingJoined: false,
      presenterId: null,
      activeSpeakerId: null,
      pinnedParticipants: new Map(),
      recordingState: null,
      meetingId: null,
      localMicOn: false,
      localWebcamOn: false,
      localScreenShareOn: false,

      // ─── HLS stream state (set by onHlsStateChanged callback) ────────────────
      hlsState: null,
      hlsUrls: null,

      // ─── HLS player state ─────────────────────────────────────────────────────
      hlsPlaybackState: null,      // "playing" | "paused" | null
      hlsAutoplayBlocked: false,
      hlsPlayerError: null,
      hlsCurrentTime: 0,
      hlsDuration: 0,
      hlsSeekableEnd: 0,
      hlsIsLive: false,
      // ─── SDK action methods ───────────────────────────────────────────────────
      leave: () => {},
      toggleMic: () => {},
      changeMic: () => {},
      toggleWebcam: () => {},
      changeWebcam: () => {},
      toggleScreenShare: () => {},
      startRecording: () => {},
      stopRecording: () => {},
      startHls: () => {},
      stopHls: () => {},

      // ─── Generic state setter (used by MeetingStoreBridge) ───────────────────
      setMeetingState: (partial) => set(partial, false, "setMeetingState"),

      // ─── HLS player lifecycle ─────────────────────────────────────────────────

      initHlsPlayer: (url, videoElement) => {
        if (_hls) { _hls.destroy(); _hls = null; }

        _videoEl = videoElement;

        const syncPlayback = () => {
          set({ hlsPlaybackState: videoElement.paused ? "paused" : "playing" }, false, "hls/playbackState");
        };

        const tryAutoplay = () => {
          videoElement.play().catch(() => {
            set({ hlsAutoplayBlocked: true }, false, "hls/autoplayBlocked");
          });
        };

        const syncTime = () => {
          set({ hlsCurrentTime: videoElement.currentTime }, false, "hls/timeupdate");
        };

        const syncSeekable = () => {
          if (videoElement.seekable.length > 0) {
            set({
              hlsSeekableEnd: videoElement.seekable.end(videoElement.seekable.length - 1),
            }, false, "hls/seekable");
          }
        };

        const syncDuration = () => {
          const dur = videoElement.duration;
          set({
            hlsDuration: isFinite(dur) ? dur : 0,
            hlsIsLive: !isFinite(dur),
          }, false, "hls/duration");
        };

        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          _hls = hls;

          hls.loadSource(url);
          hls.attachMedia(videoElement);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            set({ hlsPlayerError: null }, false, "hls/manifestLoaded");
            tryAutoplay();
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              const msg = data.details ?? "Playback error";
              set({ hlsPlayerError: msg }, false, "hls/error");
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              }
            }
          });

          set(
            { hlsPlaybackState: null, hlsAutoplayBlocked: false, hlsPlayerError: null, hlsCurrentTime: 0, hlsDuration: 0, hlsSeekableEnd: 0, hlsIsLive: false },
            false,
            "hls/init"
          );
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
          // Native HLS (Safari)
          videoElement.src = url;
          videoElement.addEventListener("loadedmetadata", tryAutoplay, { once: true });
        } else {
          set({ hlsPlayerError: "HLS is not supported in this browser." }, false, "hls/unsupported");
          return;
        }

        videoElement.addEventListener("play", syncPlayback);
        videoElement.addEventListener("pause", syncPlayback);
        videoElement.addEventListener("timeupdate", syncTime);
        videoElement.addEventListener("durationchange", syncDuration);
        videoElement.addEventListener("progress", syncSeekable);
      },

      destroyHlsPlayer: () => {
        if (_hls) { _hls.destroy(); _hls = null; }
        _videoEl = null;
        set(
          { hlsPlaybackState: null, hlsAutoplayBlocked: false, hlsPlayerError: null, hlsCurrentTime: 0, hlsDuration: 0, hlsSeekableEnd: 0, hlsIsLive: false },
          false,
          "hls/destroy"
        );
      },

      hlsPlay: () => _videoEl?.play().catch(() => {}),
      hlsPause: () => _videoEl?.pause(),
      hlsSeek: (time) => { if (_videoEl) _videoEl.currentTime = time; },

      hlsUnblockAutoplay: () => {
        _videoEl?.play().catch(() => {});
        set({ hlsAutoplayBlocked: false }, false, "hls/unblockAutoplay");
      },

      hlsSeekToLive: () => {
        if (_hls && _videoEl) _videoEl.currentTime = _hls.liveSyncPosition ?? _videoEl.duration;
      },

      hlsSetVolume: (volume) => {
        if (_videoEl) _videoEl.volume = Math.max(0, Math.min(1, volume));
      },
    }),
    { name: "MeetingStore", enabled: false }
  )
);
