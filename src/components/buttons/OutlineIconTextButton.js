import React, { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";
import { createPopper } from "@popperjs/core";

const OutlineIconTextButton = ({
  onClick,
  isFocused,
  bgColor,
  Icon,
  focusBGColor,
  disabled,
  renderRightComponent,
  fillcolor,
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
  const [tooltipShow, setTooltipShow] = useState(false);

  const btnRef = useRef();
  const tooltipRef = useRef();
  const intervalRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: "bottom",
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  const iconSize = 22 * (large ? 1 : 1);

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
    <>
      <div ref={btnRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
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
          } md:m-2 m-1 cursor-pointer`}
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
            className="flex items-center justify-center p-1 m-1 rounded-lg overflow-hidden"
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
                  <div
                    className={`lg:h-[${22 * (large ? 1 : 1)}px] w-[${
                      (22 * (large ? 1 : 1) * lottieOption?.width) /
                      lottieOption?.height
                    }px]`}
                    style={{
                      height: iconSize,
                      width:
                        (iconSize * lottieOption?.width) / lottieOption?.height,
                    }}
                  >
                    <Lottie
                      loop={lottieOption.loop}
                      autoPlay={lottieOption.autoPlay}
                      animationData={lottieOption.animationData}
                      rendererSettings={{
                        preserveAspectRatio:
                          lottieOption.rendererSettings.preserveAspectRatio,
                      }}
                      isClickToPauseDisabled
                    />
                  </div>
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
      </div>
      <div
        style={{ zIndex: 999 }}
        className={`${
          tooltipShow ? "" : "hidden"
        } overflow-hidden flex flex-col items-center justify-center pt-1`}
        ref={tooltipRef}
      >
        <div className={"rounded-md p-1.5 bg-black "}>
          <p className="text-base text-white ">{tooltipTitle || ""}</p>
        </div>
      </div>
    </>
  );
};

export default OutlineIconTextButton;
