import { Tooltip } from "@material-ui/core";
import React, { useState, useRef, useEffect } from "react";
import Lottie from "react-lottie";
import useResponsiveSize from "../../hooks/useResponsiveSize";

const OutlineIconTextButton = ({
  onClick,
  isFocused,
  bgColor,
  Icon,
  focusBGColor,
  disabled,
  renderRightComponent,
  fillColor,
  lottieOption,
  tooltipTitle,
  btnID,
  buttonText,
  large,
  isRequestProcessing,
  textColor,
}) => {
  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [blinkingState, setBlinkingState] = useState(1);

  const intervalRef = useRef();

  const iconSize = useResponsiveSize({
    xl: 22 * (large ? 1 : 1),
    lg: 22 * (large ? 1 : 1),
  });

  const startBlinking = () => {
    intervalRef.current = setInterval(() => {
      setBlinkingState((s) => (s === 1 ? 0.4 : 1));
    }, 600);
  };

  const stopBlinking = () => {
    clearInterval(intervalRef.current);

    setBlinkingState(1);
  };

  useEffect(() => {
    if (isRequestProcessing) {
      startBlinking();
    } else {
      stopBlinking();
    }
  }, [isRequestProcessing]);

  useEffect(() => {
    return () => {
      stopBlinking();
    };
  }, []);

  return (
    <Tooltip placement="bottom" title={tooltipTitle || ""}>
      <button
        className={`flex items-center justify-center  rounded-lg ${
          bgColor ? `${bgColor}` : isFocused ? "bg-white" : "bg-gray-750"
        } ${
          mouseOver
            ? "border-2 border-transparent border-solid"
            : focusBGColor
            ? `border-2 border-[${focusBGColor}] border-solid`
            : bgColor
            ? "border-2 border-transparent border-solid"
            : "border-2 border-solid border-[#ffffff33]"
        } md:p-2 p-1 cursor-pointer`}
        style={{
          transition: "all 200ms",
          transitionTimingFunction: "ease-in-out",
          opacity: blinkingState,
        }}
        id={btnID}
        onMouseEnter={() => {
          setMouseOver(true);
        }}
        onMouseLeave={() => {
          setMouseOver(false);
        }}
        onMouseDown={() => {
          setMouseDown(true);
        }}
        onMouseUp={() => {
          setMouseDown(false);
        }}
        disabled={disabled}
        onClick={onClick}
      >
        <div
          className="flex items-center justify-center  rounded-lg overflow-hidden"
          style={{
            opacity: disabled ? 0.7 : 1,
            transform: `scale(${mouseOver ? (mouseDown ? 0.97 : 1.05) : 1})`,
            transition: `all ${200 * 1}ms`,
            transitionTimingFunction: "linear",
          }}
        >
          {buttonText ? (
            lottieOption ? (
              <div className="flex items-center justify-center">
                <Lottie
                  style={{ height: iconSize }}
                  options={lottieOption}
                  eventListeners={[{ eventName: "done" }]}
                  height={iconSize}
                  width={
                    (iconSize * lottieOption?.width) / lottieOption?.height
                  }
                  isClickToPauseDisabled
                />
              </div>
            ) : (
              <p
                className={`text-sm font-semibold leading-6 ${
                  isFocused
                    ? "text-[#1c1f2e]"
                    : textColor
                    ? textColor
                    : "text-white"
                }`}
              >
                {buttonText}
              </p>
            )
          ) : null}
        </div>

        {typeof renderRightComponent === "function" && renderRightComponent()}
      </button>
    </Tooltip>
  );
};

export default OutlineIconTextButton;
