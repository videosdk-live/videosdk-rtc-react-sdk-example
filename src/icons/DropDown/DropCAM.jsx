import React from "react";

function DropCAM({fillColor}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
      className="ml-2 mt-0.5 fixed"
    >
      <g
        stroke={fillColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
        clipPath="url(#clip0_20_451)"
      >
        <path d="M13.417 4.083L9.333 7l4.084 2.916V4.083zM8.167 2.917H1.75c-.644 0-1.167.522-1.167 1.166v5.833c0 .645.523 1.167 1.167 1.167h6.417c.644 0 1.166-.522 1.166-1.167V4.083c0-.644-.522-1.167-1.166-1.167z"></path>
      </g>
      <defs>
        <clipPath id="clip0_20_451">
          <path fill="#fff" d="M0 0H14V14H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}

export default DropCAM;
