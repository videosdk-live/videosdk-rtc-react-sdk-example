import React from "react";

function RecordingIcon(props) {
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
        id="mask0_24_98"
        style={{ maskType: "alpha" }}
        width="24"
        height="24"
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
      >
        <path fill="#D9D9D9" d="M0 0H24V24H0z"></path>
      </mask>
      <g mask="url(#mask0_24_98)">
        <circle cx="12" cy="12" r="5" fill={props.fillcolor}></circle>
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={props.fillcolor}
          strokeWidth="2"
        ></circle>
      </g>
    </svg>
  );
}

export default RecordingIcon;
