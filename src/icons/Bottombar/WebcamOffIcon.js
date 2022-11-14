import * as React from "react";

const WebcamOffIcon = (props) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        d="M22.359 17.84a1.196 1.196 0 0 0 .548-1.017V7.786a1.36 1.36 0 0 0-.548-1.017.97.97 0 0 0-1.095 0L17.43 8.804a3.4 3.4 0 0 0-3.286-3.286h-4.052L22.14 17.949c-.001-.11.108-.11.219-.11Zm.219 3.841-5.257-5.424L6.916 5.517 2.863 1.34a1.036 1.036 0 0 0-1.533 0 1.117 1.117 0 0 0 0 1.583l2.519 2.596A3.379 3.379 0 0 0 1 8.91v6.78a3.386 3.386 0 0 0 .945 2.415 3.175 3.175 0 0 0 2.341.975h9.857a2.84 2.84 0 0 0 2.082-.791l4.819 4.972a1.06 1.06 0 0 0 1.533 0 1.144 1.144 0 0 0 0-1.582v.002Z"
        fill="#050A0E"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path
          fill={props.fillcolor}
          transform="translate(1 1)"
          d="M0 0h21.905v22.59H0z"
        />
      </clipPath>
    </defs>
  </svg>
);

export default WebcamOffIcon;
