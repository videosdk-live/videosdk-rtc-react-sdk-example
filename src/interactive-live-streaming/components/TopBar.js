import { OutlinedButton } from "../../components/buttons/OutlinedButton";
import RecordingIcon from "../../icons/Bottombar/RecordingIcon";
import recordingBlink from "../../animations/recording-blink.json";
import liveHLS from "../../animations/live-hls.json";
import { Constants, useMeeting } from "@videosdk.live/react-sdk";
import useIsRecording from "../../hooks/useIsRecording";
import { useEffect, useMemo, useRef } from "react";
import { MobileIconButton } from "../../components/buttons/MobileIconButton";
import OutlineIconTextButton from "../../components/buttons/OutlineIconTextButton";
import useIsHls from "../../hooks/useIsHls";
import LiveIcon from "../../icons/LiveIcon";

export function TopBar({ topBarHeight }) {
  const RecordingBTN = () => {
    const { startRecording, stopRecording, recordingState } = useMeeting();
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: recordingBlink,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
      height: 64,
      width: 160,
    };

    const isRecording = useIsRecording();

    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
      isRecordingRef.current = isRecording;
    }, [isRecording]);

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          recordingState === Constants.recordingEvents.RECORDING_STARTING ||
          recordingState === Constants.recordingEvents.RECORDING_STOPPING,
      }),
      [recordingState]
    );

    const _handleClick = () => {
      const isRecording = isRecordingRef.current;

      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    };

    return (
      <OutlinedButton
        Icon={RecordingIcon}
        onClick={_handleClick}
        isFocused={isRecording}
        buttonText={"REC"}
        tooltip={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
            ? "Start Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording"
        }
        lottieOption={isRecording ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    );
  };

  const HLSBTN = ({ isMobile, isTab }) => {
    const { startHls, stopHls, hlsState } = useMeeting({});

    const isHls = useIsHls();

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          hlsState === Constants.hlsEvents.HLS_STARTING ||
          hlsState === Constants.hlsEvents.HLS_STOPPING,
      }),
      [hlsState]
    );

    const { type, priority, gridSize } = useMemo(
      () => ({
        type: "SPOTLIGHT",
        priority: "SPEAKER",
        gridSize: "12",
      }),
      []
    );

    const typeRef = useRef(type);
    const priorityRef = useRef(priority);
    const gridSizeRef = useRef(gridSize);
    const isHlsRef = useRef(isHls);

    useEffect(() => {
      typeRef.current = type;
    }, [type]);

    useEffect(() => {
      priorityRef.current = priority;
    }, [priority]);

    useEffect(() => {
      gridSizeRef.current = gridSize;
    }, [gridSize]);

    useEffect(() => {
      isHlsRef.current = isHls;
    }, [isHls]);

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: liveHLS,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
      height: 64,
      width: 170,
    };

    const _handleStartHLS = () => {
      const type = typeRef.current;
      const priority = priorityRef.current;
      const gridSize = gridSizeRef.current;

      const layout = { type, priority, gridSize };

      startHls({ layout, theme: "DARK" });
    };

    const _handleClick = () => {
      const isHls = isHlsRef.current;

      if (isHls) {
        stopHls();
      } else {
        _handleStartHLS();
      }
    };

    return isMobile || isTab ? (
      <MobileIconButton
        onClick={_handleClick}
        tooltipTitle={
          hlsState === Constants.hlsEvents.HLS_STARTED
            ? "Stop HLS"
            : hlsState === Constants.hlsEvents.HLS_STARTING
            ? "Starting HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPED
            ? "Start HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPING
            ? "Stopping HLS"
            : "Start HLS"
        }
        Icon={LiveIcon}
        buttonText={
          hlsState === Constants.hlsEvents.HLS_STARTED
            ? "Stop HLS"
            : hlsState === Constants.hlsEvents.HLS_STARTING
            ? "Starting HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPED
            ? "Start HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPING
            ? "Stopping HLS"
            : "Start HLS"
        }
        isFocused={isHls}
        lottieOption={isHls ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    ) : (
      <OutlineIconTextButton
        onClick={_handleClick}
        tooltipTitle={
          hlsState === Constants.hlsEvents.HLS_STARTED
            ? "Stop HLS"
            : hlsState === Constants.hlsEvents.HLS_STARTING
            ? "Starting HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPED
            ? "Start HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPING
            ? "Stopping HLS"
            : "Start HLS"
        }
        buttonText={
          hlsState === Constants.hlsEvents.HLS_STARTED
            ? "Stop HLS"
            : hlsState === Constants.hlsEvents.HLS_STARTING
            ? "Starting HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPED
            ? "Start HLS"
            : hlsState === Constants.hlsEvents.HLS_STOPPING
            ? "Stopping HLS"
            : "Start HLS"
        }
        lottieOption={isHls ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    );
  };
  return (
    <div className="md:flex md:items-center md:justify-end pt-2 lg:px-2 xl:px-6 pb-0 px-2 hidden">
      <RecordingBTN />
      <HLSBTN />
    </div>
  );
}
