import { usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useCallback } from "react";

const EMOJI_MAP = {
  heartEye: "😍",
  laugh: "🤣",
  thumbsup: "👍",
  confetti: "🎉",
  clap: "👏",
};

const FlyingEmojisOverlay = ({}) => {
  const pubsubData = usePubSub("REACTION", {
    onMessageReceived: ({ message }) => {
      handleReceiveFlyingEmoji(message);
    },
  });

  const pubsubDataRef = useRef(pubsubData);

  useEffect(() => {
    pubsubDataRef.current = pubsubData;
  }, [pubsubData]);

  const overlayRef = useRef();

  // -- Handlers
  const handleRemoveFlyingEmoji = useCallback((node) => {
    if (!overlayRef.current) return;
    overlayRef.current.removeChild(node);
  }, []);

  const handleDisplayFlyingEmoji = useCallback(
    (emoji) => {
      if (!overlayRef.current) {
        return;
      }

      // console.log(`⭐ Displaying flying emoji: ${emoji}`);

      const node = document.createElement("div");
      node.appendChild(document.createTextNode(EMOJI_MAP[emoji]));
      node.className =
        Math.random() * 1 > 0.5 ? "emoji wiggle-1" : "emoji wiggle-2";
      node.style.transform = `rotate(${-30 + Math.random() * 60}deg)`;
      node.style.left = `${Math.random() * 100}%`;
      node.src = "";
      overlayRef.current.appendChild(node);

      node.addEventListener("animationend", (e) => {
        handleRemoveFlyingEmoji(e.target);
      });
    },
    [handleRemoveFlyingEmoji]
  );

  const handleReceiveFlyingEmoji = useCallback(
    (message) => {
      if (!overlayRef.current) {
        return;
      }

      // console.log(`🚨 New emoji message received: ${message}`);
      handleDisplayFlyingEmoji(message);
    },
    [handleDisplayFlyingEmoji]
  );

  // Listen to window events to show local user emojis and send the emoji to all participants on the call
  useEffect(() => {
    function handleSendFlyingEmoji(e) {
      const { emoji } = e.detail;
      // console.log(`⭐ Sending flying emoji: ${emoji}`);

      if (emoji) {
        pubsubData.current.publish(emoji);
      }
    }

    window.addEventListener("reaction_added", handleSendFlyingEmoji);
    return () =>
      window.removeEventListener("reaction_added", handleSendFlyingEmoji);
  }, [handleDisplayFlyingEmoji]);

  // Remove all event listeners on unmount to prevent console warnings
  useEffect(
    () => () =>
      overlayRef.current?.childNodes.forEach((n) =>
        n.removeEventListener("animationend", handleRemoveFlyingEmoji)
      ),
    [handleRemoveFlyingEmoji]
  );

  return <div className="flying-emojis" ref={overlayRef}></div>;
};

export default FlyingEmojisOverlay;
