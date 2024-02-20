import React from "react";

function DropMIC({fillColor}) {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="16"
    fill="none"
    viewBox="0 0 14 16"
    className="ml-1 fixed"
  >
    <path
      stroke={fillColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.25"
      d="M11.083 6.833V8A4.084 4.084 0 017 12.083m0 0A4.084 4.084 0 012.917 8V6.833M7 12.083v2.334m-2.333 0h4.666M7 1.583a1.75 1.75 0 00-1.75 1.75V8a1.75 1.75 0 103.5 0V3.333A1.75 1.75 0 007 1.583z"
    ></path>
  </svg>
  );
}

export default DropMIC;
