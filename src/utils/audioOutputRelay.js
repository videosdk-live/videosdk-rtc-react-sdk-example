// On iOS/iPadOS, HTMLMediaElement.setSinkId() is silently ignored for elements
// playing remote WebRTC tracks: WebKit renders that audio through the WebRTC
// engine's pipeline, which setSinkId does not control. Mixing all remote tracks
// into a MediaStreamAudioDestinationNode and playing the mix through a single
// relay <audio> element moves playback onto the media-element pipeline, where
// setSinkId works. See https://github.com/livekit/client-sdk-js/pull/1635

const isIOSDevice =
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

function safariMajorVersion() {
  const match = /Version\/(\d+)/.exec(navigator.userAgent);
  return match ? parseInt(match[1], 10) : null;
}

function iosMajorVersion() {
  const osMatch = /OS (\d+)_/.exec(navigator.userAgent);
  if (osMatch) return parseInt(osMatch[1], 10);
  // iPads in desktop mode report a Mac UA with no OS version; the Safari
  // major version tracks the OS major there (Safari 26.x on iPadOS 26).
  return safariMajorVersion();
}

export function shouldUseAudioRelay() {
  // Direct per-element setSinkId worked through iOS 18 / Safari 18; version 26
  // routes remote WebRTC audio past the element pipeline, so 26+ needs the
  // relay. Trust the version over feature-detection: WebKit may not expose
  // setSinkId on the prototype until an element is in a document.
  if (isIOSDevice) {
    const major = iosMajorVersion();
    if (major !== null) return major >= 26;
    return typeof HTMLMediaElement.prototype.setSinkId === "function";
  }
  // macOS Safari 26+ has the same WebRTC-pipeline bypass.
  const isMacSafari =
    /Mac/.test(navigator.userAgent) &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrome|Chromium|Edg\//.test(navigator.userAgent);
  if (!isMacSafari) return false;
  const major = safariMajorVersion();
  return major !== null && major >= 26;
}

let audioContext = null;
let destinationNode = null;
let relayElement = null;
const connectedTracks = new Map();

function log(...args) {
  console.log("[audioRelay]", ...args);
}

function resumeRelay() {
  if (!audioContext) return;
  if (audioContext.state !== "running") {
    audioContext.resume().catch(() => {});
  }
  if (relayElement.paused) {
    relayElement.play().catch(() => {});
  }
}

function ensureRelay() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  destinationNode = audioContext.createMediaStreamDestination();
  relayElement = document.createElement("audio");
  relayElement.autoplay = true;
  relayElement.playsInline = true;
  relayElement.srcObject = destinationNode.stream;
  document.body.appendChild(relayElement);
  log("created, context state:", audioContext.state);

  // Switching the output route can suspend/interrupt the context or pause the
  // relay element, which sounds like the switch went silent — auto-revive.
  audioContext.onstatechange = () => {
    log("context state changed:", audioContext.state);
    if (audioContext.state !== "running") {
      audioContext.resume().catch(() => {});
    }
  };
  relayElement.addEventListener("pause", () => {
    log("relay element paused, replaying");
    relayElement.play().catch(() => {});
  });

  // iOS also suspends the context until a user gesture; revive on any tap.
  document.addEventListener("touchend", resumeRelay, {
    capture: true,
    passive: true,
  });
  document.addEventListener("click", resumeRelay, {
    capture: true,
    passive: true,
  });
}

export function connectTrackToRelay(track, stream) {
  if (!shouldUseAudioRelay() || !track) return () => {};
  ensureRelay();
  let entry = connectedTracks.get(track);
  if (!entry) {
    // Use the same MediaStream the <audio> element plays (WebKit only feeds
    // WebAudio from remote tracks that a media element is rendering).
    const sourceNode = audioContext.createMediaStreamSource(
      stream || new MediaStream([track])
    );
    sourceNode.connect(destinationNode);
    entry = { sourceNode, refCount: 0 };
    connectedTracks.set(track, entry);
    log("track connected, total:", connectedTracks.size);
  }
  entry.refCount += 1;
  resumeRelay();
  return () => {
    const current = connectedTracks.get(track);
    if (!current) return;
    current.refCount -= 1;
    if (current.refCount <= 0) {
      current.sourceNode.disconnect();
      connectedTracks.delete(track);
    }
  };
}

export function setRelaySinkId(deviceId) {
  if (!shouldUseAudioRelay() || deviceId == null) return;
  ensureRelay();
  resumeRelay();
  relayElement
    .setSinkId(deviceId)
    .then(() => {
      log("setSinkId ok:", deviceId, "context:", audioContext.state);
    })
    .catch((err) => {
      log("setSinkId FAILED:", err.name, err.message);
    });
}
