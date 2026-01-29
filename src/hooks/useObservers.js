import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { debounce } from "../utils/common";

const VideoSDKPlayer = forwardRef(
    (
        {
            participantId,
            type = "video",
            containerStyle = {},
            className = "",
            classNameVideo = "",
            videoStyle = {},
            videoRef,
        },
        ref,
    ) => {
        const {
            webcamOn,
            webcamStream,
            isLocal,
            screenShareStream,
            screenShareOn,
        } = useParticipant(participantId);
        const internalRef = useRef(null);
        const finalVideoRef = videoRef || internalRef;

        useEffect(() => {
            const stream = type === "share" ? screenShareStream : webcamStream;
            const isOn = type === "share" ? screenShareOn : webcamOn;
            if (finalVideoRef.current) {
                if (isOn && stream) {
                    const mediaStream = new MediaStream();
                    mediaStream.addTrack(stream.track);
                    finalVideoRef.current.setAttribute("muted", "");
                    finalVideoRef.current.srcObject = mediaStream;
                    finalVideoRef.current.setAttribute("playsinline", "");
                    finalVideoRef.current.setAttribute("x5-playsinline", "");
                    finalVideoRef.current.setAttribute("webkit-playsinline", "");
                    finalVideoRef.current
                        .play()
                        .catch((error) =>
                            console.error("finalVideoRef.current.play() failed", error),
                        );
                } else {
                    finalVideoRef.current.srcObject = null;
                }
            }
        }, [
            type,
            ...(type === "share"
                ? [screenShareOn, screenShareStream]
                : type === "video"
                    ? [webcamOn, webcamStream]
                    : []),
        ]);

        return (
            <div
                ref={ref}
                className={`video-container participant-video-${participantId} ${className || ""
                    }`}
                style={{
                    objectFit: type === "share" ? "contain" : "none",
                    height: "100%",
                    ...containerStyle,
                }}
            >
                <video
                    width="100%"
                    height="100%"
                    ref={finalVideoRef}
                    autoPlay
                    className={classNameVideo}
                    muted
                    style={
                        isLocal && type !== "share"
                            ? {
                                transform: "scaleX(-1)",
                                WebkitTransform: "scaleX(-1)",
                                ...videoStyle,
                            }
                            : videoStyle
                    }
                />
            </div>
        );
    },
);

export const withAdaptiveObservers = (VideoPlayerComponent) => {
    const intersectionObserverOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0,
    };
    const debounceDelay = 400;

    return (props) => {
        const { participantId, type } = props;
        const ref = useRef(null);
        const observerRef = useRef(null);
        const resizeObserverRef = useRef(null);
        const { participant } = useParticipant(participantId);
        const { localParticipant } = useMeeting();

        const pauseStreams = useCallback(() => {
            // Check if participant and streams still exist
            if (!!participant && !!participant.streams) {
                for (const stream of participant.streams.values()) {
                    if (stream.kind === "video") {
                        stream.pause();
                    }
                }
            }
        }, [participant]);

        // 2. Define the resume logic
        const resumeStreams = useCallback(() => {
            if (!!participant && !!participant.streams) {
                for (const stream of participant.streams.values()) {
                    if (stream.kind === "video" && stream?.pausedBy !== "SUB_MANAGER") {
                        stream.resume();
                    }
                }
            }
        }, [participant]);

        useEffect(() => {
            // Skip observer setup for "share" type and local participant
            if (
                type === "share" ||
                !ref.current ||
                !participant ||
                participantId === localParticipant.id
            )
                return;

            const element = ref.current;
            if (!element || !participant) return;

            // Disconnect previous observer before creating a new one
            if (observerRef.current) observerRef.current.disconnect();

            // Debounced intersection handler
            const handleIntersectionChange = debounce((entries) => {
                console.log(entries, ">>>>>entries");

                if (!Array.isArray(entries) || entries.length === 0) return;

                const entry = entries[entries.length - 1];

                console.log(entry, "entryentryentry>>>>");

                if (entry.intersectionRatio > 0) {
                    resumeStreams();
                } else {
                    pauseStreams();
                }
            }, debounceDelay);

            observerRef.current = new IntersectionObserver(
                handleIntersectionChange,
                intersectionObserverOptions,
            );

            // Debounced resize handler
            const processResize = (width, height) => {
                if (width > 0 && height > 0) {
                    participant.setViewPort(width, height);
                }
            };

            const handleResize = debounce((entries) => {
                const {
                    contentRect: { width, height },
                } = entries[0];
                processResize(width, height);
            }, debounceDelay);

            resizeObserverRef.current = new ResizeObserver(handleResize);

            resizeObserverRef.current.observe(element);
            observerRef.current.observe(element);

            return () => {
                console.log(!!observerRef.current,">>>ON LEAVE");
                if (observerRef.current) {
                    pauseStreams();
                    observerRef.current.disconnect();
                }
                if (resizeObserverRef.current) {
                    resizeObserverRef.current.disconnect();
                }
            };
        }, []);

        return <VideoSDKPlayer ref={ref} {...props} />;
    };
};

export const VideoPlayer = ({ participantId, type, ...props }) => {
    // Memoize the wrapped component to prevent unnecessary re-renders
    const VideoPlayerComponent = useMemo(() => {
        return type === "share"
            ? VideoSDKPlayer
            : withAdaptiveObservers(VideoSDKPlayer);
    }, [type, participantId]);

    return (
        <VideoPlayerComponent
            participantId={participantId}
            type={type}
            {...props}
        />
    );
};