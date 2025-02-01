import React from "react";

const CaptionIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="white"
    width="24px"
    height="24px"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12zM8 10.5h1.5v1H8v-1zm0 2.5h1.5v1H8v-1zm2.5-2.5H12v1h-1.5v-1zm0 2.5H12v1h-1.5v-1zm2.5-2.5h1.5v1H13v-1zm0 2.5h1.5v1H13v-1zm2.5-2.5H17v1h-1.5v-1zm0 2.5H17v1h-1.5v-1z" />
  </svg>
);

export { CaptionIcon };
