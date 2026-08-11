// On iOS/iPadOS, HTMLMediaElement.setSinkId() is silently ignored for elements
// playing remote WebRTC tracks: WebKit renders that audio through the WebRTC
// engine's pipeline, which setSinkId does not control. Mixing all remote tracks
// into a MediaStreamAudioDestinationNode and playing the mix through a single
// relay <audio> element moves playback onto the media-element pipeline, where
// setSinkId works.

const isIOSDevice =
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

export function shouldUseAudioRelay() {
  return (
    isIOSDevice && typeof HTMLMediaElement.prototype.setSinkId === "function"
  );
}

let audioContext = null;
let destinationNode = null;
let relayElement = null;
const connectedTracks = new Map();

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
  relayElement.style.display = "none";
  relayElement.srcObject = destinationNode.stream;
  document.body.appendChild(relayElement);

  // iOS suspends the context until a user gesture and after audio-session
  // interruptions (e.g. route changes); revive it on any tap. The listeners
  // live until teardownRelay() runs on meeting leave.
  document.addEventListener("touchend", resumeRelay, {
    capture: true,
    passive: true,
  });
  document.addEventListener("click", resumeRelay, {
    capture: true,
    passive: true,
  });
}

export function connectTrackToRelay(track) {
  if (!shouldUseAudioRelay() || !track) return () => {};
  ensureRelay();
  let entry = connectedTracks.get(track);
  if (!entry) {
    const sourceNode = audioContext.createMediaStreamSource(
      new MediaStream([track])
    );
    sourceNode.connect(destinationNode);
    entry = { sourceNode, refCount: 0 };
    connectedTracks.set(track, entry);
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
  relayElement.setSinkId(deviceId).catch((err) => {
    console.error("Setting relay speaker device failed", err);
  });
}

export function teardownRelay() {
  if (!audioContext) return;
  document.removeEventListener("touchend", resumeRelay, { capture: true });
  document.removeEventListener("click", resumeRelay, { capture: true });
  connectedTracks.forEach(({ sourceNode }) => sourceNode.disconnect());
  connectedTracks.clear();
  relayElement.pause();
  relayElement.srcObject = null;
  relayElement.remove();
  relayElement = null;
  destinationNode = null;
  audioContext.close().catch(() => {});
  audioContext = null;
}
