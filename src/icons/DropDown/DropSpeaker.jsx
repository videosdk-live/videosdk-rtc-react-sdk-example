import React from "react";

function DropSpeaker({fillColor}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 20 20"
      className="ml-1 mt-0.5 fixed"
    >
      <path
        stroke={fillColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M15.892 4.108a8.333 8.333 0 010 11.784M12.95 7.05a4.167 4.167 0 010 5.892M9.167 4.167L5 7.5H1.667v5H5l4.167 3.333V4.167z"
      ></path>
    </svg>
  );
}

export default DropSpeaker;