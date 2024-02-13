import React from "react";

function CameraPermissionDenied() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="56"
      height="56"
      fill="none"
      viewBox="0 0 56 56"
    >
      <g filter="url(#filter0_d_20_1271)">
        <rect width="48" height="48" x="4" y="4" fill="#FF5D5D" rx="24"></rect>
      </g>
      <g filter="url(#filter1_d_20_1271)">
        <circle cx="44" cy="12" r="8" fill="#FF8A00"></circle>
      </g>
      <path
        fill="#fff"
        d="M44.876 8.258v3.432c0 .368-.022.734-.066 1.098-.044.36-.102.728-.174 1.104h-1.26c-.072-.376-.13-.744-.174-1.104a9.141 9.141 0 01-.066-1.098V8.258h1.74zm-1.944 7.8c0-.144.026-.278.078-.402.056-.124.13-.232.222-.324.096-.092.208-.164.336-.216.128-.056.268-.084.42-.084.148 0 .286.028.414.084.128.052.24.124.336.216.096.092.17.2.222.324a1.007 1.007 0 010 .81.956.956 0 01-.222.324 1.09 1.09 0 01-.75.294c-.152 0-.292-.026-.42-.078a1.053 1.053 0 01-.336-.216 1.085 1.085 0 01-.222-.324 1.074 1.074 0 01-.078-.408z"
      ></path>
      <g clipPath="url(#clip0_20_1271)">
        <path
          fill="#fff"
          d="M37.501 32.909c.155-.097.282-.23.37-.388.087-.157.132-.334.13-.513v-8a1.176 1.176 0 00-.146-.504 1.216 1.216 0 00-.354-.396.904.904 0 00-1 0l-3.5 1.8a2.967 2.967 0 00-.907-2.028A3.15 3.15 0 0030 22h-3.7l11 11.006c-.001-.097.099-.097.2-.097zm.2 3.401l-4.8-4.802-9.5-9.508-3.7-3.7a.946.946 0 00-.7-.3.972.972 0 00-.7.3.988.988 0 00-.3.701.963.963 0 00.3.7l2.3 2.299a3.11 3.11 0 00-1.878 1.03A2.936 2.936 0 0018 25.004v6.003c-.008.394.064.785.212 1.152.148.367.369.702.65.986.277.279.609.499.977.648.367.148.763.221 1.161.215h9c.35.013.697-.042 1.024-.162.326-.12.624-.304.876-.538l4.4 4.402a.971.971 0 00.7.29.996.996 0 00.7-.29.997.997 0 00.29-.7.997.997 0 00-.29-.701v.002z"
        ></path>
      </g>
      <defs>
        <filter
          id="filter0_d_20_1271"
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
            result="effect1_dropShadow_20_1271"
          ></feBlend>
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_20_1271"
            result="shape"
          ></feBlend>
        </filter>
        <filter
          id="filter1_d_20_1271"
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
            result="effect1_dropShadow_20_1271"
          ></feBlend>
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_20_1271"
            result="shape"
          ></feBlend>
        </filter>
        <clipPath id="clip0_20_1271">
          <path
            fill="#fff"
            d="M0 0H20V20H0z"
            transform="translate(18 18)"
          ></path>
        </clipPath>
      </defs>
    </svg>
  );
}

export default CameraPermissionDenied;
