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
    holdTypeSelected: [holdTypeSelected, setHoldTypeSelected],
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
  const [allSvg, setAllSvg] = useState<{
    svg: string;
    color: string;
  }[] | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setKey(Math.random());
    }
    getBoundingBox();
    console.log("svg mask", svg);
  }, [svg]);

  useEffect(() => {
    if (svgStr) {
      console.log("svgStr", svgStr);
      const splitSvgStr = svgStr.split(/(?=M)/g);
      const filteredSvgStr = splitSvgStr.filter((str) => str);
      const lastSvg = filteredSvgStr[filteredSvgStr.length - 1]; // pegando o último SVG
  
      setAllSvg((currentAllSvg) => {
        // Se não existir nenhum SVG, inicializa o allSvg
        if (!currentAllSvg || currentAllSvg.length === 0) {
          return lastSvg ? [{ svg: lastSvg, color: holdTypeSelected.color }] : [];
        }
  
        // Verificando se o último SVG já existe em allSvg
        const existingIndex = currentAllSvg.findIndex(item => item.svg === lastSvg);
  
        if (existingIndex === -1) {
          // Se o último SVG é novo, adicione-o com a cor atual
          return [...currentAllSvg, { svg: lastSvg, color: holdTypeSelected.color }];
        } else if (filteredSvgStr.length < currentAllSvg.length) {
          // Se há menos SVGs em filteredSvgStr do que em allSvg, um SVG foi removido
          // Remova o último SVG de allSvg
          const newAllSvg = currentAllSvg.slice(0, -1);
          return newAllSvg;
        }
  
        // Se não houver mudanças no número de SVGs, retorne o allSvg atual
        return currentAllSvg;
      });
    }
  }, [svgStr]); // Removendo holdTypeSelected.color da lista de dependências
  
  
  
  

  useEffect(() => {
    console.log("allSvg", allSvg);
  }, [allSvg]);

  useEffect(() => { 
    console.log("holdTypeSelected", holdTypeSelected);
  }, [holdTypeSelected]);

  const bbX = boundingBox?.x;
  const bbY = boundingBox?.y;
  const bbWidth = boundingBox?.width;
  const bbHeight = boundingBox?.height;
  const bbMiddleY = bbY && bbHeight && bbY + bbHeight / 2;
  const bbWidthRatio = bbWidth && bbWidth / xScale;
  const colors = ['#ff1717', '#1717ff' ,'#ffff17'];


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
        <filter id={`glow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
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
              d={path.svg}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="1"
              fillOpacity="0"
              stroke={path.color}
              strokeWidth="2"
              ref={pathRef}
              filter={`url(#glow-${path.color})`}
            />
          ))}
        </>
      )}
    </svg>
  );
};

export default SvgMask;