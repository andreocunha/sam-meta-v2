import Konva from "konva";
import React, {
  Profiler,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as _ from "underscore";
import Canvas from "./Canvas";
import FeatureSummary from "./FeatureSummary";
import {
  AnnotationProps,
  modelInputProps,
  StageProps,
} from "./helpers/Interface";
import AppContext from "./hooks/createContext";
import ImagePicker from "./ImagePicker";
import LoadingModal from "./LoadingModal";
import SegmentDrawer from "./SegmentDrawer";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


type Points = { sx: number; sy: number; x: number; y: number };

const Stage = ({
  scale,
  handleResetState,
  handleMagicErase,
  handleImage,
  hasClicked,
  setHasClicked,
  handleSelectedImage,
  image,
  isStandalone,
  model,
}: StageProps) => {
  const {
    click: [click, setClick],
    clicks: [clicks, setClicks],
    clicksHistory: [clicksHistory, setClicksHistory],
    svg: [svg, setSVG],
    stickers: [stickers, setStickers],
    segmentTypes: [segmentTypes, setSegmentTypes],
    isErased: [isErased, setIsErased],
    canvasHeight: [canvasHeight, setCanvasHeight],
    maskImg: [, setMaskImg],
    userNegClickBool: [userNegClickBool, setUserNegClickBool],
    activeSticker: [activeSticker, setActiveSticker],
    isLoading: [isLoading, setIsLoading],
    hasNegClicked: [hasNegClicked, setHasNegClicked],
    stickerTabBool: [stickerTabBool, setStickerTabBool],
    isMultiMaskMode: [isMultiMaskMode, setIsMultiMaskMode],
    svgs: [svgs, setSVGs],
    isHovering: [isHovering, setIsHovering],
    showLoadingModal: [showLoadingModal, setShowLoadingModal],
    predMask: [predMask, setPredMask],
    predMasks: [predMasks, setPredMasks],
    predMasksHistory: [predMasksHistory, setPredMasksHistory],
    isToolBarUpload: [isToolBarUpload, setIsToolBarUpload],
    drawnLines: [drawnLines, setDrawnLines],
    drawnLinesHistory: [drawnLinesHistory, setDrawnLinesHistory],
    isAllowDrawing: [isAllowDrawing, setIsAllowDrawing],
    allSvg: [allSvg, setAllSvg],
  } = useContext(AppContext)!;
  const [annotations, setAnnotations] = useState<Array<AnnotationProps>>([]);
  const [newAnnotation, setNewAnnotation] = useState<Array<AnnotationProps>>(
    []
  );
  const [prevAnnotaiton, setPrevAnnotation] = useState<Array<AnnotationProps>>(
    []
  );
  const [showGallery, setShowGallery] = useState<boolean>(true);
  const [isHoverToolTip, setIsHoverToolTip] = useState<boolean>(false);
  const [numOfDragEvents, setNumOfDragEvents] = useState<number>(0);
  const [shouldUpdateOnDrag, setShouldUpdateOnDrag] = useState<boolean>(true);
  const [points, setPoints] = useState<Points>();
  const [canvasScale, setCanvasScale] = useState<number>(1);
  const [homepageTimer, setHomepageTimer] = useState<any>();
  const [shouldShowHomepageOverlay, setShouldShowHomepageOverlay] =
    useState(false);
  const DRAG_THRESHOLD = 4;
  const HOMEPAGE_IMAGE = "/assets/gallery/cave.jpeg";
  const HOMEPAGE_TIME_LIMIT = 5000;
  const MOBILE_CUTOUT_LIMIT = 30;
  const konvaRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [allText, setAllText] = useState<
    string | React.DOMElement<React.DOMAttributes<HTMLElement>, HTMLElement>
  >("");

  useEffect(() => {
    if (isStandalone && clicks && clicks?.length > 0) {
      setHomepageTimer(
        setTimeout(() => {
          setShouldShowHomepageOverlay(true);
        }, HOMEPAGE_TIME_LIMIT)
      );
    } else {
      homepageTimer && clearTimeout(homepageTimer);
    }
    return () => {
      homepageTimer && clearTimeout(homepageTimer);
    };
  }, [isStandalone, clicks]);

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

  const handleMouseDown = (e: any) => {
    console.log("handleMouseDown", isAllowDrawing);
    if (stickerTabBool) return;
    if (clicksHistory) setClicksHistory(null);
    if (predMasksHistory) setPredMasksHistory(null);
    if (drawnLinesHistory) setDrawnLinesHistory(null);
    if (segmentTypes !== "Box") return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNumOfDragEvents(0);
    if (newAnnotation.length === 0) {
      setNewAnnotation([{ x, y, width: 0, height: 0, clickType: -1 }]);
    }
  };

  const handleMoveToMask = _.throttle((e: any, x: number, y: number) => {
    const click = getClick(e, x, y);
    if (!click) return;
    setClicks([click]);
  }, 15);

  const handleMouseMove = (e: any) => {
    if (stickerTabBool) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    if (segmentTypes === "Click" && shouldUpdateOnDrag && !hasClicked) {
      handleMoveToMask(e, x, y);
    } else if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      setNewAnnotation([getAnnotation({ sx, sy, x, y })]);
      setAnnotations([]);
      if (shouldUpdateOnDrag) {
        setPoints({ sx, sy, x, y });
        setNumOfDragEvents((prevValue) => prevValue + 1);
      }
    }
  };

  useEffect(() => {
    if (shouldUpdateOnDrag) {
      if (numOfDragEvents === DRAG_THRESHOLD && points) {
        setNumOfDragEvents(0);
        handleSegmentByBox(points);
      }
    }
  }, [numOfDragEvents, points]);

  const handleMouseUp = (e: any, shouldSetClick?: boolean) => {
    if (stickerTabBool) return;
    setIsLoading(true);
    setHasClicked(true);
    const { x, y } = e.target.getStage().getPointerPosition();
    switch (segmentTypes) {
      case "Click":
        if (hasClicked || shouldSetClick) {
          if (shouldSetClick) {
            const newClick = getClick(e, x, y) || null;
            if (newClick?.clickType === 0) {
              setHasNegClicked(true);
            }
            setClick(newClick);
          } else {
            handleSegmentByClick(e, x, y);
          }
        }
        break;
      default:
        break;
      // return null;
    }
  };

  const handleMouseOut = () => {
    if (stickerTabBool) return;
    if (clicks?.length === 1 && segmentTypes === "Click" && !hasClicked) {
      _.defer(handleResetInteraction);
      setTimeout(handleResetInteraction, 25);
    }
  };

  const getClick = (
    e: any,
    x: number,
    y: number
  ): modelInputProps | undefined => {
    let clickType;
    if (e.evt.button === 0 || !e.evt.button) {
      clickType = 1;
    } else if (e.evt.button === 2) {
      clickType = 0;
    }
    if (clickType === undefined) return;
    if (userNegClickBool) clickType = 0;
    x *= scale!.scale / canvasScale;
    y *= scale!.scale / canvasScale;
    return { x, y, width: null, height: null, clickType };
  };

  const handleSegmentByClick = (e: any, x: number, y: number) => {
    const click = getClick(e, x, y);
    if (!click) return;
    setClicks([...(clicks || []), click]);
  };

  const handleSegmentByBox = (
    { sx, sy, x, y }: Points,
    extraClick?: modelInputProps,
    newerClicks?: modelInputProps[]
  ) => {
    sx *= scale!.scale / canvasScale;
    sy *= scale!.scale / canvasScale;
    x *= scale!.scale / canvasScale;
    y *= scale!.scale / canvasScale;
    const newClick = {
      x: Math.min(sx, x),
      y: Math.min(sy, y),
      width: Math.max(sx, x),
      height: Math.max(sy, y),
      clickType: 2,
    };
    const newClicks = newerClicks || [...(clicks || [])];
    if (extraClick) {
      newClicks.push(extraClick);
    }
    if (newClicks[0] && !newClicks[0].width) {
      newClicks.unshift(newClick);
    } else {
      newClicks[0] = newClick;
    }
    setClicks(newClicks);
  };

  const getAnnotation = ({ sx, sy, x, y }: Points): AnnotationProps => {
    return {
      x: sx,
      y: sy,
      width: x - sx,
      height: y - sy,
      clickType: 2,
    };
  };

  const adjustPointsToRange = (
    points: Points,
    extraClick?: modelInputProps,
    newClicks?: modelInputProps[]
  ) => {
    const range = findClickRange(extraClick, newClicks);
    if (!range || !range.xMin || !range.yMin || !range.xMax || !range.yMax)
      return;
    let { sx, sy, x, y } = points;
    const xMin = Math.min(sx, x);
    const yMin = Math.min(sy, y);
    const xMax = Math.max(sx, x);
    const yMax = Math.max(sy, y);
    if (range.xMin < xMin) {
      if (sx < x) {
        sx = range.xMin;
      } else {
        x = range.xMin;
      }
    }
    if (range.yMin < yMin) {
      if (sy < y) {
        sy = range.yMin;
      } else {
        y = range.yMin;
      }
    }
    if (range.xMax > xMax) {
      if (sx > x) {
        sx = range.xMax;
      } else {
        x = range.xMax;
      }
    }
    if (range.yMax > yMax) {
      if (sy > y) {
        sy = range.yMax;
      } else {
        y = range.yMax;
      }
    }
    points.sx = sx;
    points.sy = sy;
    points.x = x;
    points.y = y;
  };

  const findClickRange = (
    extraClick?: modelInputProps,
    newClicks?: modelInputProps[]
  ) => {
    let xMin;
    let yMin;
    let xMax;
    let yMax;
    const allClicks = newClicks ? newClicks : clicks ? [...clicks!] : null;
    if (!allClicks) return;
    if (extraClick) {
      allClicks.push(extraClick);
    }
    for (let click of allClicks) {
      if (click.width) continue;
      if (click.clickType === 0) continue;
      if (!xMin || click.x < xMin) {
        xMin = click.x;
      }
      if (!yMin || click.y < yMin) {
        yMin = click.y;
      }
      if (!xMax || click.x > xMax) {
        xMax = click.x;
      }
      if (!yMax || click.y > yMax) {
        yMax = click.y;
      }
    }
    xMin = xMin ? (xMin * canvasScale) / scale!.scale : xMin;
    yMin = yMin ? (yMin * canvasScale) / scale!.scale : yMin;
    xMax = xMax ? (xMax * canvasScale) / scale!.scale : xMax;
    yMax = yMax ? (yMax * canvasScale) / scale!.scale : yMax;
    return { xMin, yMin, xMax, yMax };
  };

  const handleResetInteraction = (forceFullReset?: boolean) => {
    setSVG(null);
    setSVGs(null);
    setAllSvg(null);
    setClick(null);
    setClicks(null);
    setAnnotations([]);
    setNewAnnotation([]);
    setClicksHistory(null);
    setMaskImg(null);
    setUserNegClickBool(false);
    setIsHovering(null);
    setPredMask(null);
    setPredMasks(null);
    setPredMasksHistory(null);
    setIsLoading(false);
    setPoints(undefined);
    setDrawnLines([]);
    if (segmentTypes === "Click" && !forceFullReset) {
      if (!isMultiMaskMode) {
        setHasClicked(false);
      }
    } else {
      setHasClicked(false);
      setIsMultiMaskMode(false);
    }
  };

  useEffect(() => {
    if (!clicks) {
      setAnnotations([]);
      setNewAnnotation([]);
      setPoints(undefined);
    }
  }, [clicks]);

  const handleUndoInteraction = () => {
    if(isAllowDrawing){
      // remove last drawn line and add it to history
      const newDrawnLines = [...drawnLines];
      const lastDrawnLine = newDrawnLines.pop();
      const newDrawnLinesHistory = [...(drawnLinesHistory || [])];
      setDrawnLines(newDrawnLines);
      if (lastDrawnLine) {
        newDrawnLinesHistory.push(lastDrawnLine);
      }
      setDrawnLinesHistory(newDrawnLinesHistory);
      return;
    }

    if (predMasks?.length && clicks?.length) {
      const newPredMasks = [...predMasks];
      const oldPredMask = newPredMasks.pop();
      const newPredMasksHistory = [...(predMasksHistory || [])];
      setPredMasks(newPredMasks);
      if (oldPredMask) {
        newPredMasksHistory.push(oldPredMask);
      }
      setPredMasksHistory(newPredMasksHistory);
      const newClicks = [...clicks];
      const oldClick = newClicks.pop();
      const newClicksHistory = [...(clicksHistory || [])];
      if (oldClick) {
        newClicksHistory.push(oldClick);
      }
      setClicksHistory(newClicksHistory);
      if (clicks.length === 1) {
        setPredMask(null);
        setHasClicked(false);
        setClicks(null);
        setSVG(null);
        setIsErased(false);
        setMaskImg(null);
      } else {
        setIsLoading(true);
        setPredMask(newPredMasks[newPredMasks.length - 1]);
        if (points) {
          const pointsClone = { ...points };
          adjustPointsToRange(pointsClone, undefined, newClicks);
          setAnnotations([getAnnotation(pointsClone)]);
          handleSegmentByBox(pointsClone, undefined, newClicks);
        } else {
          setClicks(newClicks);
        }
      }
    }
  };

  const handleRedoInteraction = () => {
    if(isAllowDrawing){
      // get last drawn line from history and add it back to drawn lines
      const newDrawnLines = [...drawnLines];
      const lastDrawnLine = drawnLinesHistory?.pop();
      const newDrawnLinesHistory = [...(drawnLinesHistory || [])];
      setDrawnLines(newDrawnLines);
      if (lastDrawnLine) {
        newDrawnLines.push(lastDrawnLine);
      }
      setDrawnLinesHistory(newDrawnLinesHistory);
      return;
    }

    if (
      clicksHistory?.length &&
      prevAnnotaiton?.length &&
      segmentTypes === "Box"
    ) {
      setAnnotations(prevAnnotaiton);
      setNewAnnotation([]);
      setPrevAnnotation([]);
    }
    if (predMasksHistory?.length && clicksHistory?.length) {
      setIsLoading(true);
      setHasClicked(true);
      const newPredMasks = [...(predMasks || [])];
      const newPredMasksHistory = [...(predMasksHistory || [])];
      const newPredMask = newPredMasksHistory.pop();
      if (newPredMask) {
        newPredMasks.push(newPredMask);
      }
      setPredMasksHistory(newPredMasksHistory);
      setPredMasks(newPredMasks);
      setPredMask(newPredMasks[newPredMasks.length - 1]);
      const newClicks = [...(clicks || [])];
      const newClicksHistory = [...(clicksHistory || [])];
      const newClick = newClicksHistory.pop();
      if (newClick) {
        newClicks.push(newClick);
      }
      setClicksHistory(newClicksHistory);
      if (points) {
        const pointsClone = { ...points };
        adjustPointsToRange(pointsClone, undefined, newClicks);
        setAnnotations([getAnnotation(pointsClone)]);
        handleSegmentByBox(pointsClone, undefined, newClicks);
      } else {
        setClicks(newClicks);
      }
    }
  };

  return (
    <>
      {image || isToolBarUpload ? (
        <div className="relative flex items-center justify-center w-full h-full">
          {showLoadingModal && (
            <LoadingModal handleResetState={handleResetState} />
          )}
          <SegmentDrawer
            handleResetState={handleResetState}
            handleResetInteraction={handleResetInteraction}
            handleUndoInteraction={handleUndoInteraction}
            handleRedoInteraction={handleRedoInteraction}
          />
          <TransformWrapper disabled={isAllowDrawing}>
            <TransformComponent>
              <div className="relative flex items-center justify-center w-full h-full"
                style={{
                  width: "100vw",
                  height: "100vh",
                }}
              >
                <Canvas
                  konvaRef={konvaRef}
                  annotations={annotations}
                  newAnnotation={newAnnotation}
                  scale={scale}
                  handleMouseUp={handleMouseUp}
                  handleMouseDown={handleMouseDown}
                  handleMouseMove={handleMouseMove}
                  handleMouseOut={handleMouseOut}
                  containerRef={containerRef}
                  hasClicked={hasClicked}
                  setCanvasScale={setCanvasScale}
                  isHoverToolTip={[isHoverToolTip, setIsHoverToolTip]}
                  allText={[allText, setAllText]}
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      ) : !isToolBarUpload ? (
        <div className="flex items-stretch justify-center flex-1 overflow-hidden stage">
          {/* <ImagePicker
            handleSelectedImage={handleSelectedImage}
            showGallery={[showGallery, setShowGallery]}
          /> */}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Stage;
