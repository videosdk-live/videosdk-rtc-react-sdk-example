import * as React from "react";

const ParticipantAddHostIcon = (props) => (
  <svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m4.717 10.71.667 5.49H3.75V18h10.5v-1.8h-1.634l.667-5.49C14.84 10.343 16 8.91 16 7.2v-.9c0-.497-.392-.9-.875-.9h-5.25V3.359c.523-.312.875-.893.875-1.559C10.75.806 9.966 0 9 0S7.25.806 7.25 1.8c0 .666.352 1.247.875 1.559V5.4h-5.25A.888.888 0 0 0 2 6.3v.9c0 1.71 1.161 3.144 2.717 3.51Z"
      fill={props.fill}
    />
  </svg>
);

export default ParticipantAddHostIcon;
