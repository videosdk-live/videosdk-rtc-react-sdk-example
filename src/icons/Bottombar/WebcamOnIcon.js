import React from "react";

function WebcamOnIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <mask
        id="mask0_27_287"
        style={{ maskType: "alpha" }}
        width="24"
        height="24"
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
      >
        <path fill="#D9D9D9" d="M0 0H24V24H0z"></path>
      </mask>
      <g mask="url(#mask0_27_287)">
        <path
          fill={props.fillcolor}
          d="M22.03 7.187a.98.98 0 00-1.079 0l-3.774 1.94a3.3 3.3 0 00-3.236-3.126H4.236A3.178 3.178 0 001 9.236v6.47a3.178 3.178 0 003.235 3.236h9.706a3.3 3.3 0 003.235-3.127l3.881 1.94a1.136 1.136 0 001.4-.43.972.972 0 00.109-.54V8.158a1.286 1.286 0 00-.538-.971z"
        ></path>
      </g>
    </svg>
  );
}

export default WebcamOnIcon;
