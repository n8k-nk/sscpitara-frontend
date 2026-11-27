import { useId } from "react";

export default function RouteSkeleton({ label = "page", inline = false }) {
  const uid = useId().replace(/:/g, "");
  const pathId = `sp-${uid}`;
  const maskId = `ink-${uid}`;

  return (
    <div
      className={inline ? "route-loader route-loader-inline" : "route-loader"}
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Loading {label}…
      </span>
      <svg
        className="loader-logo"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 96 80"
        width="84"
        height="70"
        aria-hidden="true"
      >
        <defs>
          <path
            id={pathId}
            d="M29 13h37c13 0 21 7 21 19s-9 21-22 21h-2v19H50V31h13v10h2c5 0 8-4 8-9s-3-7-8-7H29c-4 0-6 2-6 5 0 2 2 4 5 5l6 2c9 3 13 8 13 16 0 12-8 19-21 19H4l4-13h19c4 0 6-2 6-5 0-2-1-4-5-5l-7-2C12 44 8 39 8 31c0-11 8-18 21-18Z"
          />
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="96"
            height="80"
          >
            <g fill="none" stroke="white" strokeWidth="19" strokeLinecap="square">
              <path
                className="loader-ribbon"
                pathLength="1"
                d="M4 66h23c9 0 13-5 13-12 0-6-4-9-12-12l-4-1c-7-2-9-6-9-11 0-7 6-11 14-11h37c10 0 14 5 14 13 0 9-6 15-15 15h-8"
              />
              <path className="loader-stem" pathLength="1" d="M56.5 31v42" />
            </g>
          </mask>
        </defs>
        <g transform="translate(13 -2) skewX(-13)" fill="#5B8DEF">
          <use className="loader-solid" href={`#${pathId}`} />
          <use className="loader-trace" href={`#${pathId}`} mask={`url(#${maskId})`} />
        </g>
      </svg>
    </div>
  );
}
