import React from "react";

function PauseButton() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
      className="ml-6 mt-1.5"
    >
      <g clipPath="url(#clip0_20_538)">
        <path
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
          d="M5.833 8.75v-3.5m2.334 3.5v-3.5M12.833 7A5.833 5.833 0 111.167 7a5.833 5.833 0 0111.666 0z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_20_538">
          <path fill="#fff" d="M0 0H14V14H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}

export default PauseButton;
