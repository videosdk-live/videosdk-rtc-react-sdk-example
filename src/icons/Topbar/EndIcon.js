import * as React from "react";

const EndIcon = (props) => (
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
      <path
        d="M12.001 9.858a15.938 15.938 0 0 0-4.6.668v2.883a.932.932 0 0 1-.556.836 11.66 11.66 0 0 0-2.665 1.717 1.04 1.04 0 0 1-.7.265 1.016 1.016 0 0 1-.705-.274l-2.48-2.298a.884.884 0 0 1 0-1.319A17.65 17.65 0 0 1 12.001 8a17.65 17.65 0 0 1 11.704 4.336.888.888 0 0 1 .218 1.018.873.873 0 0 1-.218.296l-2.476 2.298a1.049 1.049 0 0 1-1.405.01 11.656 11.656 0 0 0-2.665-1.718.932.932 0 0 1-.556-.835V10.52A16.098 16.098 0 0 0 12 9.858Z"
        fill={props.fillColor}
      />
    </g>
  </svg>
);

export default EndIcon;
