import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RadialProgress } from "react-daisyui";
import { Circle, Image, Layer, Path, Rect, Ring, Stage, Line } from "react-konva";
import {
  canvasScaleInitializer,
  canvasScaleResizer,
} from "./helpers/CanvasHelper";
import colors from "./helpers/colors";
import {
  AnnotationProps,
  modelInputProps,
  modelScaleProps,
} from "./helpers/Interface";
import AppContext from "./hooks/createContext";
import SvgMask from "./SvgMask";

// The line below is part of the fix for the iOS canvas area limit of 16777216
Konva.pixelRatio = 1;

interface CanvasProps {
  konvaRef: React.RefObject<Konva.Stage> | null;
  handleMouseUp: (e: any, forceHasClicked?: boolean) => void;
  scale: modelScaleProps | null;
  handleMouseDown: (e: any) => void;
  handleMouseMove: (e: any) => void;
  handleMouseOut: (e: any) => void;
  annotations: Array<AnnotationProps>;
  newAnnotation: Array<AnnotationProps>;
  containerRef: RefObject<HTMLDivElement>;
  hasClicked: boolean;
  isStandalone?: boolean;
  setCanvasScale: React.Dispatch<React.SetStateAction<number>>;
  isHoverToolTip: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  allText: [allText: any, setAllText: any];
}

const Canvas = ({
  konvaRef,
  handleMouseUp,
  scale,
  handleMouseDown,
  handleMouseMove,
  handleMouseOut,
  annotations,
  newAnnotation,
  containerRef,
  hasClicked,
  setCanvasScale,
  isStandalone,
}: CanvasProps) => {
  const {
    click: [click, setClick],
    clicks: [clicks, setClicks],
    image: [image],
    svg: [svg],
    segmentTypes: [segmentTypes, setSegmentTypes],
    isErased: [isErased],
    isErasing: [isErasing],
    isLoading: [isLoading, setIsLoading],
    canvasWidth: [, setCanvasWidth],
    canvasHeight: [, setCanvasHeight],
    maskImg: [maskImg],
    stickerTabBool: [stickerTabBool, setStickerTabBool],
    isModelLoaded: [isModelLoaded, setIsModelLoaded],
    isMultiMaskMode: [isMultiMaskMode, setIsMultiMaskMode],
    isHovering: [isHovering, setIsHovering],
    holdTypeSelected: [holdTypeSelected, setHoldTypeSelected],
    isAllowDrawing: [isAllowDrawing, setAllowDrawing],
    drawnLines: [drawnLines, setDrawnLines],
  } = useContext(AppContext)!;
  if (!image) return null;

  // custom drawing holds
  const [lines, setLines] = React.useState<any[]>([]);
  const isDrawing = React.useRef(false);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const convertLinesToSVGPath = (scaleX: number, scaleY: number) => {
    if(lines.length === 0) return "";
    return lines.map((line, index) => {
      const points = line.points.map((point: number, i: number) => {
        const coordinate = Math.round(point * (i % 2 === 0 ? scaleX : scaleY));
        if(i === 0 && index === 0) {
          return `M${coordinate}`;
        }
        if(i === 2) {
          return `L${coordinate}`;
        }
        else {
          return coordinate;
        }
      }).join(" ");
      return points;
    }).join(" ");
  };

  const handleExport = () => {
    // console.log("scale!.height", scale!.height)
    // console.log("scale!.width", scale!.width)
    // const heightScale = scale!.height / scale!.width  
    // console.log("heightScale", heightScale)
    // const xScale = scale!.uploadScale;
    // const yScale = heightScale * scale!.uploadScale;
    // console.log("xScale", xScale)
    // console.log("yScale", yScale)
    const scalePath = scale!.uploadScale > 1 ? scale!.uploadScale : 0.685;
    const svgPath = convertLinesToSVGPath(scalePath, scalePath);
    console.log("SVG Path: ", svgPath);
    if(svgPath.length > 0) {
      setDrawnLines((prev) => [...prev, svgPath]);
    }
    setLines([]);
  };

  const handleMouseDownLines = (e: any) => {
    if(!isAllowDrawing) return;
    isDrawing.current = true;
    if(!e?.target?.getStage()) return;
    const pos = e?.target?.getStage()?.getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMoveLines = (e: any) => {
    if(!isAllowDrawing) return;
    // no drawing - skipping
    if (!isDrawing.current) return;

    const stage = e?.target?.getStage();
    if(!stage) return;
    const point = stage?.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUpLines = () => {
    if(!isAllowDrawing) return;
    isDrawing.current = false;
    handleExport();
  };


  console.log('scale', scale);

  const MAX_CANVAS_AREA = 1677721;
  const w = scale!.width;
  const h = scale!.height;
  const area = w * h;
  const canvasScale =
    area > MAX_CANVAS_AREA ? Math.sqrt(MAX_CANVAS_AREA / (w * h)) : 1;
  let canvasDimensions = {
    width: Math.floor(w * canvasScale),
    height: Math.floor(h * canvasScale),
  };

  const imageClone = new window.Image();
  imageClone.src = image.src;
  imageClone.width = w;
  imageClone.height = h;
  const resizer = canvasScaleInitializer({
    width: canvasDimensions.width,
    height: canvasDimensions.height,
    containerRef,
    shouldFitToWidth: isStandalone,
  });
  const [scalingStyle, setScalingStyle] = useState(resizer.scalingStyle);
  const [scaledDimensionsStyle, setScaledDimensionsStyle] = useState(
    resizer.scaledDimensionsStyle
  );

  const [shouldShowAnimation, setShouldShowAnimation] = useState<
    boolean | null
  >(null);
  const [hasTouchMoved, setHasTouchMoved] = useState(false);
  const [numOfTouches, setNumOfTouches] = useState(0);
  const annotationsToDraw = [...annotations, ...newAnnotation];
  const positiveClickColor = "turquoise";
  const negativeClickColor = "pink";
  const handleClickColor = (num: number) => {
    switch (num) {
      case 0:
        return negativeClickColor;
      case 1:
        return positiveClickColor;
      default:
        return null;
    }
  };
  const clickColor = click ? handleClickColor(click.clickType) : null;

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const resized = canvasScaleResizer({
          width: canvasDimensions.width,
          height: canvasDimensions.height,
          containerWidth: width,
          containerHeight: height,
          shouldFitToWidth: isStandalone,
        });
        console.log("resized", resized);
        setCanvasWidth(resized.scaledWidth);
        setCanvasHeight(resized.scaledHeight);
        setScaledDimensionsStyle({
          width: resized.scaledWidth,
          height: resized.scaledHeight,
        });
        setScalingStyle(resized.scalingStyle);
        console.log("resized.scalingStyle", resized.scalingStyle);
      }
    }
  });

  useEffect(() => {
    setCanvasScale(canvasScale);
    setCanvasWidth(resizer.scaledWidth);
    setCanvasHeight(resizer.scaledHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const superDefer = (cb: Function) => {
    setTimeout(
      () =>
        window.requestAnimationFrame(() => {
          setTimeout(() => {
            cb();
          }, 0);
        }),
      0
    );
  };

  useEffect(() => {
    let newClicks: modelInputProps[] | null = null;
    if (clicks && click) {
      newClicks = [...clicks, click];
    } else if (click) {
      newClicks = [click];
    }
    if (newClicks) {
      superDefer(() => superDefer(() => setClicks(newClicks)));
    }
  }, [click]);

  useEffect(() => {
    if (isHovering && clicks && clicks.length == 1) {
      setShouldShowAnimation(true);
    } else {
      setShouldShowAnimation(false);
    }
  }, [clicks, isHovering]);

  const shouldShowSpinner =
    (segmentTypes === "All" && isLoading) ||
    (isLoading && !hasClicked && !isModelLoaded.boxModel) ||
    (isLoading && isErasing);

  return (
    <>
      {shouldShowSpinner && (
        <div
          className={`absolute z-10 flex items-center justify-center w-full h-full md:hidden`}
        >
          <RadialProgress
            className="animate-spin"
            size={
              0.3 * Math.min(resizer.scaledWidth, resizer.scaledHeight) + "px"
            }
            thickness="1rem"
            value={70}
          ></RadialProgress>
        </div>
      )}
      {/* mouse event none pointer-events-none */}
      <div
        className={`absolute flex w-full h-full items-center justify-center`}
        style={(isAllowDrawing && numOfTouches === 1) ? { overflow: "hidden" } : {}}
        ref={containerRef}
      >
        <div
          className={`Canvas relative w-fit h-fit bg-black" ${
            isLoading ? "pointer-events-none" : ""
          }`}
          style={{
            ...scaledDimensionsStyle,
            backgroundColor: 'black'
          }}
        >
          <img
            src={image.src}
            className={`absolute w-full h-auto pointer-events-none ${
              isLoading ||
              (svg && svg?.length > 0) || drawnLines.length > 0
                ? "opacity-40"
                : ""
            }`}
            style={{ margin: 0 }}
            ref={imageRef}
          ></img>
          {segmentTypes !== "All" &&
            // svg &&
            scale &&
            (hasClicked || drawnLines.length > 0) &&
            !isMultiMaskMode && (
              <SvgMask
                xScale={scale.width * scale.uploadScale}
                yScale={scale.height * scale.uploadScale}
              />
            )}
          <Stage
            className="konva"
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            onMouseDown={(e) => {
              if(isAllowDrawing) {
                handleMouseDownLines(e);
                return;
              }
              if (stickerTabBool) return;
              handleMouseDown(e);
            }}
            onMouseUp={(e) => {
              if(isAllowDrawing) {
                handleMouseUpLines();
                return;
              }
              if (stickerTabBool) {
                setStickerTabBool(false);
                return;
              }
              if (segmentTypes === "All") return;
              if (isMultiMaskMode && clicks) return;
              setIsLoading(true);
              handleMouseUp(e);
            }}
            onMouseMove={(e) => {
              if(isAllowDrawing) {
                handleMouseMoveLines(e);
                return;
              }
              handleMouseMove(e);
            }}
            onMouseOut={handleMouseOut}
            onMouseLeave={handleMouseOut}
            onTouchStart={(e) => {
              if (stickerTabBool) return;
              handleMouseDown(e);
              if(isAllowDrawing && numOfTouches === 0) {
                handleMouseDownLines(e);
              }
              setNumOfTouches((prev) => {
                return prev + 1;
              });
            }}
            onTouchEnd={(e) => {
              console.log("touch end. Num of touches: ", numOfTouches);
              if (stickerTabBool) return;
              if (
                segmentTypes !== "All" &&
                !hasTouchMoved &&
                numOfTouches === 1
              ) {
                if(isAllowDrawing) {
                  handleMouseUpLines();
                  setNumOfTouches(0);
                  return;
                }
                setIsLoading(true);
                superDefer(() => superDefer(() => handleMouseUp(e, true)));
              }
              setHasTouchMoved(false);
              setNumOfTouches(0);
            }}
            onTouchMove={(e) => {
              if(isAllowDrawing) {
                handleMouseMoveLines(e);
                return;
              }
              setHasTouchMoved(true);
            }}
            onContextMenu={(e: KonvaEventObject<PointerEvent>) =>
              e.evt.preventDefault()
            }
            ref={konvaRef}
            style={scalingStyle}
          >
            <Layer>
              {lines?.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={holdTypeSelected.color || "#df4b26"}
                  strokeWidth={3}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={'source-over'}
                />
              ))}
            </Layer>
            <Layer name="annotations">
              {click && clickColor && (
                <>
                  <Circle
                    x={(click.x * canvasScale) / scale!.scale}
                    y={(click.y * canvasScale) / scale!.scale}
                    fill={clickColor}
                    shadowColor={
                      clickColor === positiveClickColor
                        ? "black"
                        : negativeClickColor
                    }
                    shadowBlur={5}
                    preventDefault={false}
                    radius={(5 * canvasScale) / scale!.scale}
                  />
                  <Ring
                    x={(click.x * canvasScale) / scale!.scale}
                    y={(click.y * canvasScale) / scale!.scale}
                    fill={clickColor}
                    shadowColor={
                      clickColor === positiveClickColor
                        ? "black"
                        : negativeClickColor
                    }
                    shadowBlur={5}
                    preventDefault={false}
                    radius={(55 * canvasScale) / scale!.scale}
                    innerRadius={(50 * canvasScale) / scale!.scale}
                    outerRadius={(60 * canvasScale) / scale!.scale}
                  />
                </>
              )}
              {!isErased &&
                annotationsToDraw.map((value, i) => {
                  return (
                    <Rect
                      key={i}
                      x={value.x}
                      y={value.y}
                      width={value.width}
                      height={value.height}
                      fill="transparent"
                      stroke="white"
                      strokeWidth={1.5}
                      preventDefault={false}
                    />
                  );
                })}
            </Layer>
          </Stage>
          {segmentTypes !== "All" && maskImg && !hasClicked && (
            <img
              src={maskImg?.src}
              style={{ margin: 0 }}
              className={`absolute top-0 opacity-40 pointer-events-none w-full h-full`}
            ></img>
          )}
          {shouldShowSpinner && (
            <div
              className={`hidden absolute z-10 md:flex items-center justify-center w-full h-full top-0`}
            >
              <RadialProgress
                className="animate-spin"
                size={
                  0.3 * Math.min(resizer.scaledWidth, resizer.scaledHeight) +
                  "px"
                }
                thickness="1rem"
                value={70}
              ></RadialProgress>
            </div>
          )}
          </div>
        </div>
    </>
  );
};

export default Canvas;
