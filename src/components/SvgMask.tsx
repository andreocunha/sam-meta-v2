import React, { useContext, useEffect, useState, useRef } from "react";
import AppContext from "./hooks/createContext";

interface SvgMaskProps {
  xScale: number;
  yScale: number;
  svgStr: string;
  className?: string | undefined;
}

const SvgMask = ({
  xScale,
  yScale,
  svgStr,
  className = "",
}: SvgMaskProps) => {
  const {
    click: [click, setClick],
    image: [image],
    isLoading: [isLoading, setIsLoading],
    isErasing: [isErasing, setIsErasing],
    svg: [svg],
    isMultiMaskMode: [isMultiMaskMode, setIsMultiMaskMode],
  } = useContext(AppContext)!;
  const [key, setKey] = useState(Math.random());
  const [boundingBox, setBoundingBox] = useState<DOMRect | undefined>(
    undefined
  );
  const pathRef = useRef<SVGPathElement>(null);
  const getBoundingBox = () => {
    if (!pathRef?.current) return;
    setBoundingBox(pathRef.current.getBBox());
  };
  const [allSvg, setAllSvg] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setKey(Math.random());
    }
    getBoundingBox();
    console.log("svg mask", svg);
  }, [svg]);

  useEffect(() => {
    console.log("svgStr", svgStr);
    if (svgStr) {
      // split svgStr into multiple paths by M, but keep the M
      const splitSvgStr = svgStr.split(/(?=M)/g);
      // remove all empty strings
      const filteredSvgStr = splitSvgStr.filter((str) => str);
      setAllSvg(filteredSvgStr);
    }
  }, [svgStr]);

  useEffect(() => {
    console.log("allSvg", allSvg);
  }, [allSvg]);

  const bbX = boundingBox?.x;
  const bbY = boundingBox?.y;
  const bbWidth = boundingBox?.width;
  const bbHeight = boundingBox?.height;
  const bbMiddleY = bbY && bbHeight && bbY + bbHeight / 2;
  const bbWidthRatio = bbWidth && bbWidth / xScale;
  const colors = ['#399198', '#5a18e4', '#eb199f', '#dd32f5', '#47bc50', '#1463cf', '#b32bfd', '#a5e055', '#92e9bf', '#1e0cd5'];


  return (
    <svg
      className={`absolute w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${xScale} ${yScale}`}
      key={key}
    >
      {!isMultiMaskMode && bbX && bbWidth && (
        <>
          <radialGradient
            id={"gradient"}
            cx={0}
            cy={0}
            r={bbWidth}
            gradientUnits="userSpaceOnUse"
            gradientTransform={`translate(${bbX - bbWidth / 4},${bbMiddleY})`}
          >
            <stop offset={0} stopColor="white" stopOpacity="0"></stop>
            <stop offset={0.25} stopColor="white" stopOpacity={0.7}></stop>
            <stop offset={0.5} stopColor="white" stopOpacity="0"></stop>
            <stop offset={0.75} stopColor="white" stopOpacity={0.7}></stop>
            <stop offset={1} stopColor="white" stopOpacity="0"></stop>
            <animateTransform
              attributeName="gradientTransform"
              attributeType="XML"
              type="scale"
              from={0}
              to={12}
              dur={`1.5s`}
              begin={".3s"}
              fill={"freeze"}
              additive="sum"
            ></animateTransform>
          </radialGradient>
        </>
      )}
      <clipPath id={"clip-path"}>
        <path d={svgStr} />
      </clipPath>
      {colors?.map((color, index) => (
        <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} />
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} />
        </filter>
      ))}
      <image
        width="100%"
        height="100%"
        xlinkHref={image?.src}
        clipPath={`url(#clip-path)`}
      />
      {!click && (!isLoading || isErasing) && (
        <>
          {!isMultiMaskMode && bbWidthRatio && (
            <path
              id={"mask-gradient"}
              className={`mask-gradient ${
                bbWidthRatio > 0.5 && window.innerWidth < 768 ? "hidden" : ""
              }`}
              d={svgStr}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0"
              fillOpacity="1"
              fill={`url(#gradient)`}
            />
          )}
          {/* split svgStr into multiple paths */}
          {(allSvg && allSvg.length > 0) && allSvg.map((path, index) => (
            <path
              id={`mask-path-${index}`}
              className="mask-path"
              d={path}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="1"
              fillOpacity="0"
              stroke={colors[index % colors.length]}
              strokeWidth="2"
              ref={pathRef}
              filter={`url(#glow-${index % colors.length})`}
            />
          ))}
        </>
      )}
    </svg>
  );
};

export default SvgMask;
