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
import { Circle, Image, Layer, Path, Rect, Ring, Stage } from "react-konva";
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
  } = useContext(AppContext)!;
  if (!image) return null;

  const MAX_CANVAS_AREA = 1677721;
  const w = scale!.width;
  const h = scale!.height;
  const area = w * h;
  const canvasScale =
    area > MAX_CANVAS_AREA ? Math.sqrt(MAX_CANVAS_AREA / (w * h)) : 1;
  const canvasDimensions = {
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
  const scrollRef = useRef<HTMLDivElement>(null);
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
        let width;
        let height;
        if (entry.contentBoxSize) {
          // Firefox implements `contentBoxSize` as a single content rect, rather than an array
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;
          width = contentBoxSize.inlineSize;
          height = contentBoxSize.blockSize;
        } else {
          width = entry.contentRect.width;
          height = entry.contentRect.height;
        }
        const resized = canvasScaleResizer({
          width: canvasDimensions.width,
          height: canvasDimensions.height,
          containerWidth: width,
          containerHeight: height,
          shouldFitToWidth: isStandalone,
        });
        setCanvasWidth(resized.scaledWidth);
        setCanvasHeight(resized.scaledHeight);
        setScaledDimensionsStyle(resized.scaledDimensionsStyle);
        setScalingStyle(resized.scalingStyle);
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
    const padding = isStandalone ? 0 : 144; // pt-36 = 36rem = 144px
    const el = scrollRef.current;
    if (el) {
      const maxScrollLeft = resizer.scaledWidth - resizer.containerWidth;
      const maxScrollTop = resizer.scaledHeight - resizer.containerHeight;
      el.scrollLeft = maxScrollLeft / 2;
      el.scrollTop = padding - (maxScrollTop - padding) / 2;
    }
  }, [scalingStyle]);

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
      <div
        className={`absolute w-full h-full overflow-auto Canvas-wrapper md:overflow-visible md:w-auto md:h-auto absolute-center ${
          !isStandalone ? "pt-36 md:pt-0" : ""
        }`}
        ref={scrollRef}
      >
        <div
          onMouseOver={() => {
            if (segmentTypes === "Click" && isMultiMaskMode) {
              setIsHovering(true);
            }
          }}
          onMouseOut={() => {
            if (
              segmentTypes === "Click" &&
              isMultiMaskMode &&
              clicks !== null &&
              clicks.length === 1
            ) {
              setIsHovering(false);
            }
          }}
          className={`Canvas relative ${
            isLoading ? "pointer-events-none" : ""
          } ${
            shouldShowAnimation
              ? "rotate"
              : isHovering === false
              ? "unrotate"
              : ""
          } ${isMultiMaskMode ? "multi-mask-mode" : ""}`}
          style={scaledDimensionsStyle}
        >
          <div className="absolute w-full h-full bg-black pointer-events-none background"></div>
          <img
            src={image.src}
            className={`absolute w-full h-full pointer-events-none ${
              isLoading ||
              (hasClicked && !isMultiMaskMode) ||
              (isMultiMaskMode && clicks)
                ? "opacity-40"
                : ""
            }`}
            style={{ margin: 0 }}
          ></img>
          {segmentTypes !== "All" &&
            svg &&
            scale &&
            hasClicked &&
            !isMultiMaskMode && (
              <SvgMask
                xScale={scale.width * scale.uploadScale}
                yScale={scale.height * scale.uploadScale}
                svgStr={svg.join(" ")}
              />
            )}
          <Stage
            className="konva"
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            onMouseDown={(e) => {
              if (stickerTabBool) return;
              handleMouseDown(e);
            }}
            onMouseUp={(e) => {
              if (stickerTabBool) {
                setStickerTabBool(false);
                return;
              }
              if (segmentTypes === "All") return;
              if (isMultiMaskMode && clicks) return;
              setIsLoading(true);
              handleMouseUp(e);
            }}
            onMouseMove={handleMouseMove}
            onMouseOut={handleMouseOut}
            onMouseLeave={handleMouseOut}
            onTouchStart={(e) => {
              if (stickerTabBool) return;
              handleMouseDown(e);
              setNumOfTouches((prev) => {
                return prev + 1;
              });
            }}
            onTouchEnd={(e) => {
              if (stickerTabBool) return;
              if (
                segmentTypes !== "All" &&
                !hasTouchMoved &&
                numOfTouches === 1
              ) {
                setIsLoading(true);
                superDefer(() => superDefer(() => handleMouseUp(e, true)));
              }
              setHasTouchMoved(false);
              setNumOfTouches(0);
            }}
            onTouchMove={() => {
              setHasTouchMoved(true);
            }}
            onContextMenu={(e: KonvaEventObject<PointerEvent>) =>
              e.evt.preventDefault()
            }
            ref={konvaRef}
            style={scalingStyle}
          >
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
