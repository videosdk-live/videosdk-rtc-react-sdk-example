import { SvgIcon } from "@material-ui/core";
import React from "react";

const RaiseHand = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 27 27">
      <svg
        id="front_hand_black_24dp"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <rect id="Rectangle_7016" width="24" height="24" fill="none" />
        <path
          id="Path_6011"
          d="M19.75,8A1.25,1.25,0,0,0,18.5,9.25V15H18a3.009,3.009,0,0,0-3,3H14a4.007,4.007,0,0,1,3.5-3.97V3.25a1.25,1.25,0,0,0-2.5,0V11H14V1.25a1.25,1.25,0,0,0-2.5,0V11h-1V2.75a1.25,1.25,0,0,0-2.5,0V12H7V5.75a1.25,1.25,0,0,0-2.5,0v10a8.25,8.25,0,0,0,16.5,0V9.25A1.25,1.25,0,0,0,19.75,8Z"
          transform="translate(1.5)"
          fill={props.fillColor}
        />
      </svg>
    </SvgIcon>
  );
};

export default RaiseHand;
