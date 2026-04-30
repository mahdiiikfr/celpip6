import React from 'react';

export const UKFlag = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 30"
    className={className}
    preserveAspectRatio="none"
  >
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z" />
    </clipPath>
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

export const USFlag = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 7410 3900"
    className={className}
  >
    <rect width="7410" height="3900" fill="#B22234" />
    <path
      d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410"
      stroke="#fff"
      strokeWidth="300"
    />
    <rect width="2964" height="2100" fill="#3C3B6E" />
    <g fill="#fff">
      <g id="s18">
        <g id="s9">
          <g id="s5">
            <g id="s4">
              <path id="s" d="M247,90 317.53423,307.082039 132.935769,172.917961H361.064231L176.46577,307.082039z" />
              <use xlinkHref="#s" y="420" />
              <use xlinkHref="#s" y="840" />
              <use xlinkHref="#s" y="1260" />
            </g>
            <use xlinkHref="#s" y="1680" />
          </g>
          <use xlinkHref="#s4" x="247" y="210" />
        </g>
        <use xlinkHref="#s9" x="494" />
      </g>
      <use xlinkHref="#s18" x="988" />
      <use xlinkHref="#s9" x="1976" />
      <use xlinkHref="#s5" x="2470" />
    </g>
  </svg>
);
