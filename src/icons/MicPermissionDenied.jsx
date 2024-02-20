import React from "react";

function MicPermissionDenied() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="56"
      height="56"
      fill="none"
      viewBox="0 0 56 56"
    >
      <g filter="url(#filter0_d_20_1262)">
        <rect width="48" height="48" x="4" y="4" fill="#FF5D5D" rx="24"></rect>
      </g>
      <g filter="url(#filter1_d_20_1262)">
        <circle cx="44" cy="12" r="8" fill="#FF8A00"></circle>
      </g>
      <path
        fill="#fff"
        d="M44.876 8.258v3.432c0 .368-.022.734-.066 1.098-.044.36-.102.728-.174 1.104h-1.26c-.072-.376-.13-.744-.174-1.104a9.141 9.141 0 01-.066-1.098V8.258h1.74zm-1.944 7.8c0-.144.026-.278.078-.402.056-.124.13-.232.222-.324.096-.092.208-.164.336-.216.128-.056.268-.084.42-.084.148 0 .286.028.414.084.128.052.24.124.336.216.096.092.17.2.222.324a1.007 1.007 0 010 .81.956.956 0 01-.222.324 1.09 1.09 0 01-.75.294c-.152 0-.292-.026-.42-.078a1.053 1.053 0 01-.336-.216 1.085 1.085 0 01-.222-.324 1.074 1.074 0 01-.078-.408zM35.641 27.436h-1.745a5.043 5.043 0 01-.447 2.104l1.265 1.261a6.636 6.636 0 00.927-3.365zm-4.122.17c0-.057.016-.113.016-.17v-6.155a3.08 3.08 0 10-6.16 0v.19l6.144 6.134zM20.523 19.23l-1.309 1.307 6.17 6.167v.738a3.071 3.071 0 003.738 3.001l1.704 1.703a5.662 5.662 0 01-2.371.528c-2.834 0-5.442-2.154-5.442-5.232h-1.745c0 3.503 2.793 6.397 6.16 6.894v3.36h2.053v-3.364a7.281 7.281 0 002.608-.928l4.297 4.293 1.309-1.303L20.523 19.23z"
      ></path>
      <defs>
        <filter
          id="filter0_d_20_1262"
          width="56"
          height="56"
          x="0"
          y="0"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset></feOffset>
          <feGaussianBlur stdDeviation="2"></feGaussianBlur>
          <feComposite in2="hardAlpha" operator="out"></feComposite>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix>
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_20_1262"
          ></feBlend>
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_20_1262"
            result="shape"
          ></feBlend>
        </filter>
        <filter
          id="filter1_d_20_1262"
          width="20"
          height="20"
          x="34"
          y="4"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="2"></feOffset>
          <feGaussianBlur stdDeviation="1"></feGaussianBlur>
          <feComposite in2="hardAlpha" operator="out"></feComposite>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix>
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_20_1262"
          ></feBlend>
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_20_1262"
            result="shape"
          ></feBlend>
        </filter>
      </defs>
    </svg>
  );
}

export default MicPermissionDenied;
