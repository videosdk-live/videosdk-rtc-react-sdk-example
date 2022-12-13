import React, { useRef, useState } from "react";
import Lottie from "lottie-react";
import { createPopper } from "@popperjs/core";

export const MobileIconButton = ({
  badge,
  onClick,
  Icon,
  isFocused,
  bgColor,
  disabledOpacity,
  focusIconColor,
  disabled,
  large,
  tooltipTitle,
  btnID,
  buttonText,
  lottieOption,
}) => {
  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef();
  const tooltipRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: "bottom",
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  const iconSize = 24 * (large ? 1.7 : 1);

  return (
    <>
      <div ref={btnRef} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        <div
          className="p-0 rounded-lg"
          style={{
            transition: `all ${200 * 0.5}ms`,
            transitionTimingFunction: "linear",
          }}
        >
          <button
            className="flex flex-col items-center justify-center"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
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
              className="p-1 relative flex items-center justify-center rounded-lg"
              style={{
                opacity: disabled ? disabledOpacity || 0.7 : 1,
                transform: `scale(${mouseOver ? (mouseDown ? 0.95 : 1.1) : 1})`,
                transition: `all ${200 * 0.5}ms`,
                transitionTimingFunction: "linear",
              }}
            >
              {badge && (
                <div class="inline-flex absolute -top-2 -right-3 justify-center items-center w-6 h-6 text-xs font-bold text-white bg-black rounded-full">
                  {badge}
                </div>
              )}

              {lottieOption ? (
                <div
                  className={`flex items-center justify-center p-[5px] rounded-[5px]`}
                  style={{ backgroundColor: bgColor }}
                >
                  <div
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
                <Icon
                  style={{
                    color: isFocused ? focusIconColor || "#fff" : "#95959E",
                    height: iconSize,
                    width: iconSize,
                  }}
                  fillcolor={isFocused ? focusIconColor || "#fff" : "#95959E"}
                />
              )}
            </div>
            <div>
              {buttonText ? (
                <p
                  className={`${
                    isFocused ? "text-white" : "text-gray-900"
                  } text-sm`}
                >
                  {buttonText}
                </p>
              ) : null}
            </div>
          </button>
        </div>
      </div>
      <div
        style={{ zIndex: 999 }}
        className={`${
          tooltipShow ? "" : "hidden"
        } overflow-hidden flex flex-col items-center justify-center pb-1`}
        ref={tooltipRef}
      >
        <div className={"rounded-md p-1.5 bg-black "}>
          <p className="text-base text-white ">{tooltipTitle || ""}</p>
        </div>
      </div>
    </>
  );
};
