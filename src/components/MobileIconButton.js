import { Badge, Tooltip, useTheme } from "@material-ui/core";
import React, { useState } from "react";
import Lottie from "react-lottie";

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

  const iconSize = 24 * (large ? 1.7 : 1);

  return (
    <Tooltip placement="bottom" title={tooltipTitle || ""}>
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
            className="p-1 flex items-center justify-center rounded-lg"
            style={{
              opacity: disabled ? disabledOpacity || 0.7 : 1,
              transform: `scale(${mouseOver ? (mouseDown ? 0.95 : 1.1) : 1})`,
              transition: `all ${200 * 0.5}ms`,
              transitionTimingFunction: "linear",
            }}
          >
            <Badge max={1000} color={"secondary"} badgeContent={badge}>
              {lottieOption ? (
                <div
                  className={`flex items-center justify-center p-[5px] rounded-[5px]`}
                  style={{ backgroundColor: bgColor }}
                >
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
                <Icon
                  style={{
                    color: isFocused ? focusIconColor || "#fff" : "#95959E",
                    height: iconSize,
                    width: iconSize,
                  }}
                  fillColor={isFocused ? focusIconColor || "#fff" : "#95959E"}
                />
              )}
            </Badge>
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
    </Tooltip>
  );
};
