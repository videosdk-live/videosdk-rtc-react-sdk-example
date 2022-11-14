import React from "react";

function EndIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <mask
        id="mask0_27_262"
        style={{ maskType: "alpha" }}
        width="24"
        height="24"
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
      >
        <path fill="#D9D9D9" d="M0 0H24V24H0z"></path>
      </mask>
      <g mask="url(#mask0_27_262)">
        <path
          fill={props.fillcolor}
          d="M12.001 9.858a15.938 15.938 0 00-4.6.668v2.883a.932.932 0 01-.556.836 11.66 11.66 0 00-2.665 1.717 1.04 1.04 0 01-.7.265 1.016 1.016 0 01-.705-.274l-2.48-2.298a.884.884 0 010-1.319A17.65 17.65 0 0112.001 8a17.65 17.65 0 0111.704 4.336.888.888 0 01.218 1.018.873.873 0 01-.218.296l-2.476 2.298a1.049 1.049 0 01-1.405.01 11.656 11.656 0 00-2.665-1.718.932.932 0 01-.556-.835V10.52A16.098 16.098 0 0012 9.858z"
        ></path>
      </g>
    </svg>
  );
}

export default EndIcon;
