import React from "react";

const HLSIcon = ({ fillColor }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill={fillColor || "#FF0000"} />
    <path
      d="M4.93 4.93a10 10 0 0 0 0 14.14M19.07 4.93a10 10 0 0 1 0 14.14"
      stroke={fillColor || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7.76 7.76a6 6 0 0 0 0 8.49M16.24 7.76a6 6 0 0 1 0 8.49"
      stroke={fillColor || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default HLSIcon;
