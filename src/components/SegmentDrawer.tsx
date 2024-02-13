import { useContext, useEffect, useRef, useState } from "react";
import { getCookieConsentValue } from "react-cookie-consent";
import * as ReactGA from "react-ga4";
import AppContext from "./hooks/createContext";
import SegmentOptions from "./SegmentOptions";
import { colorsHold } from "./hooks/createContext";


interface SegmentDrawerProps {
  handleResetState: () => void;
  handleResetInteraction: (flag?: boolean) => void;
  handleUndoInteraction: () => void;
  handleRedoInteraction: () => void;
  handleMagicErase: () => void;
  handleImage: (img?: HTMLImageElement) => void;
  handleMultiMaskMode: () => void;
  userNegClickBool: [
    userNegClickBool: boolean,
    setUserNegClickBool: (e: boolean) => void
  ];
  showGallery: [showGallery: boolean, setShowGallery: (e: boolean) => void];
  hasClicked: boolean;
  handleSelectedImage: (
    data: File | URL,
    options?: { shouldDownload?: boolean; shouldNotFetchAllModel?: boolean }
  ) => void;
}

const SegmentDrawer = ({
  handleResetInteraction,
  handleUndoInteraction,
  handleRedoInteraction,
  handleMagicErase,
  handleImage,
  handleMultiMaskMode,
  hasClicked,
  handleSelectedImage,
}: SegmentDrawerProps) => {
  const {
    segmentTypes: [segmentTypes, setSegmentTypes],
    activeSticker: [activeSticker, setActiveSticker],
    didShowAMGAnimation: [didShowAMGAnimation, setDidShowAMGAnimation],
    isToolBarUpload: [isToolBarUpload, setIsToolBarUpload],
    holdTypeSelected: [holdTypeSelected, setHoldTypeSelected],
    isAllowDrawing: [isAllowDrawing, setIsAllowDrawing],
    drawnLines: [drawnLines, setDrawnLines],
  } = useContext(AppContext)!;

  const [uploadClick, setUploadClick] = useState<boolean>(true);
  const [visibleClickHover, setVisibleClickHover] = useState<boolean>(false);
  const [isCutOut, setIsCutOut] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isClickCollapsed, setIsClickCollapsed] = useState(true);
  const [isBoxCollapsed, setIsBoxCollapsed] = useState(true);
  const [isAllCollapsed, setIsAllCollapsed] = useState(true);
  const [isCutOutCollapsed, setIsCutOutCollapsed] = useState(true);
  const [isClickMounted, setIsClickMounted] = useState(false);
  const [isBoxMounted, setIsBoxMounted] = useState(false);
  const [isAllMounted, setIsAllMounted] = useState(false);
  const [isCutOutMounted, setIsCutOutMounted] = useState(false);
  let clickTimeout: string | number | NodeJS.Timeout | undefined;

  const [selectedOption, setSelectedOption] = useState<string>("IA");
  const [isExpanded, setIsExpanded] = useState(true);
  const drawRef = useRef<HTMLCanvasElement>(null);

  // Função para alternar entre expandido e minimizado
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const contentStyle = {
    transition: 'max-height 0.5s ease-in-out',
    maxHeight: isExpanded ? '500px' : '0px', // Ajuste conforme o conteúdo
    overflow: 'hidden',
  };

  useEffect(() => {
    // if any thing was interacted outside the segment drawer, close it
    const closeDrawer = (e: MouseEvent | TouchEvent) => {
      if (drawRef.current && !drawRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', closeDrawer);
    document.addEventListener('touchstart', closeDrawer);
    document.addEventListener('scroll', closeDrawer as EventListener);

    return () => {
      document.removeEventListener('mousedown', closeDrawer);
      document.removeEventListener('touchstart', closeDrawer);
      document.removeEventListener('scroll', closeDrawer as EventListener);
    };
  }, []);


  return (
    <section
      className="absolute bottom-0 z-30 flex flex-row w-fit bg-white rounded-xl items-center justify-between"
      style={{ backgroundColor: 'rgba(184, 184, 184, 0.7)', maxWidth: '400px', height: 50, bottom: 0 }}
      ref={drawRef}
    >

      <div className="flex flex-row w-fit items-center justify-center px-2 gap-2">
        <button
          onClick={() => {
            setIsAllowDrawing(false);
          }}
          className="w-10 h-10 bg-white rounded-md"
          style={!isAllowDrawing ? { border: "3px solid #33ff00" } : {border: "3px solid #7c7c7c"}}
        >
          <img src="/assets/hand.svg" alt="Hand" className="w-full h-auto" />
        </button>
        <button
          onClick={() => {
            setIsAllowDrawing(true);
          }}
          className="w-10 h-10 bg-white rounded-md"
          style={isAllowDrawing ? { border: "3px solid #33ff00" } : {border: "3px solid #7c7c7c"}}
        >
          <img src="/assets/draw.svg" alt="Draw" className="w-10 h-10" />
        </button>
      </div>

      {/* vertical line */}
      <div style={{ width: "2px", height: "70%", backgroundColor: "#e7e7e7", marginLeft: 10, marginRight: 10 }}></div>

      <div className="flex flex-row w-fit items-center justify-center px-2 gap-2">
        {/* 3 buttons to holdTypeSelected, red, blue and yellow */}
        <button
          style={{
            backgroundColor: colorsHold.red,
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            border: holdTypeSelected.color === colorsHold.red ? "3px solid #33ff00" : "none",
            outline: "none",
            cursor: "pointer",
            transform: holdTypeSelected.color === colorsHold.red ? "scale(1.2)" : "none"
          }}
          onClick={() => {
            setHoldTypeSelected({ id: 0, color: colorsHold.red });
          }}
        ></button>
        <button
          style={{
            backgroundColor: colorsHold.blue,
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            border: holdTypeSelected.color === colorsHold.blue ? "3px solid #33ff00" : "none",
            outline: "none",
            cursor: "pointer",
            transform: holdTypeSelected.color === colorsHold.blue ? "scale(1.2)" : "none"
          }}
          onClick={() => {
            setHoldTypeSelected({ id: 1, color: colorsHold.blue });
          }}
        ></button>
        <button
          style={{
            backgroundColor: colorsHold.yellow,
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            border: holdTypeSelected.color === colorsHold.yellow ? "3px solid #33ff00" : "none",
            outline: "none",
            cursor: "pointer",
            transform: holdTypeSelected.color === colorsHold.yellow ? "scale(1.2)" : "none"
          }}
          onClick={() => {
            setHoldTypeSelected({ id: 2, color: colorsHold.yellow });
          }}
        ></button>
      </div>

      <div className="flex flex-col fixed"
        style={{ top: "10px", right: "10px", width: 140 }}
      >
        {isAllowDrawing ?
          <SegmentOptions
            type="Draw"
            handleResetInteraction={handleResetInteraction}
            handleUndoInteraction={handleUndoInteraction}
            handleRedoInteraction={handleRedoInteraction}
          />
          :
          (
            <SegmentOptions
              type="AI"
              handleResetInteraction={handleResetInteraction}
              handleUndoInteraction={handleUndoInteraction}
              handleRedoInteraction={handleRedoInteraction}
            />
          )}
      </div>

    </section>
  );
};

export default SegmentDrawer;
