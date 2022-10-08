import * as React from "react";

const WebcamOnIcon = (props) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{
        maskType: "alpha",
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={24}
      height={24}
    >
      <path fill="#D9D9D9" d="M0 0h24v24H0z" />
    </mask>
    <g mask="url(#a)">
      <path
        d="M22.03 7.187a.98.98 0 0 0-1.079 0l-3.774 1.94a3.3 3.3 0 0 0-3.236-3.126H4.236A3.178 3.178 0 0 0 1 9.236v6.47a3.178 3.178 0 0 0 3.235 3.236h9.706a3.3 3.3 0 0 0 3.235-3.127l3.881 1.94a1.136 1.136 0 0 0 1.4-.43.972.972 0 0 0 .109-.54V8.158a1.286 1.286 0 0 0-.538-.971Z"
        fill={props.fillColor}
      />
    </g>
  </svg>
);

export default WebcamOnIcon;
