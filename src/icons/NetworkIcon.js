import * as React from "react";

function NetworkIcon(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3.8 9.33333H2V13H3.8V9.33333Z" fill={props.color1} />
      <path d="M7.39998 7.5H5.59998V13H7.39998V7.5Z" fill={props.color2} />
      <path d="M11 5.20831H9.20001V13H11V5.20831Z" fill={props.color3} />
      <path d="M14.6 2H12.8V13H14.6V2Z" fill={props.color4} />
    </svg>
  );
}

export default NetworkIcon;
