import * as React from "react";

const VideoCamOnIcon = (props) => (
  <svg
    width={18}
    height={18}
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
      width={18}
      height={18}
    >
      <path fill="#D9D9D9" d="M0 0h18v18H0z" />
    </mask>
    <g mask="url(#a)">
      <path
        d="M17.549 3.99a.818.818 0 0 0-.9 0L13.5 5.61a2.754 2.754 0 0 0-2.7-2.61H2.7A2.652 2.652 0 0 0 0 5.7v5.4a2.652 2.652 0 0 0 2.7 2.7h8.1a2.754 2.754 0 0 0 2.699-2.61l3.24 1.62a.947.947 0 0 0 1.168-.36.81.81 0 0 0 .09-.45V4.8a1.073 1.073 0 0 0-.448-.81Z"
        fill={"#fff"}
      />
    </g>
  </svg>
);

export default VideoCamOnIcon;
