import * as React from "react";

const RecordingIcon = (props) => (
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
      <circle cx={12} cy={12} r={5} fill={props.fillColor} />
      <circle cx={12} cy={12} r={9} stroke={props.fillColor} strokeWidth={2} />
    </g>
  </svg>
);

export default RecordingIcon;
