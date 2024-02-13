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
      className="absolute bottom-0 z-30 flex flex-col w-full bg-white rounded-xl"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', maxWidth: '400px' }}
      ref={drawRef}
    >
      <div className="flex justify-center items-center p-4 h-10 w-full"
        onClick={toggleExpand}
      >
        <div
          className="w-10 h-1 bg-gray-400 rounded-full"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
        </div>
      </div>
        <div className="px-4" style={contentStyle}>
          <div
            onClick={() => {
              segmentTypes !== "Click" && handleResetInteraction();
              getCookieConsentValue("sa_demo") === "true" &&
                ReactGA.default.send({
                  category: "event",
                  action: "is_click",
                });
              clearTimeout(clickTimeout);
              setSegmentTypes("Click");
              setIsCutOut(false);
              setDidShowAMGAnimation(false);
            }}
            onMouseEnter={() => {
              clearTimeout(clickTimeout);
              clickTimeout = setTimeout(() => {
                setIsClickCollapsed(false);
                setVisibleClickHover(true);
                setIsClickMounted(!isClickMounted);
              }, 700);
            }}
            onMouseLeave={() => {
              setIsClickCollapsed(true);
              setIsBoxCollapsed(true);
              setIsAllCollapsed(true);
              setIsCutOutCollapsed(true);
              // setVisibleClickHover(false);
              clearTimeout(clickTimeout);
              setIsClickMounted(false);
              setIsBoxMounted(false);
              setIsAllMounted(false);
              setIsCutOutMounted(false);
            }}
          >
            <p className="text-sm font-bold mb-1">
              Escolha a cor da garra:
            </p>
            <div className="flex flex-row w-full justify-between">
              {/* 3 buttons to holdTypeSelected, red, blue and yellow */}
              <button
                style={{
                  backgroundColor: colorsHold.red,
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  border: holdTypeSelected.color === colorsHold.red ? "3px solid #878686" : "none",
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
                  border: holdTypeSelected.color === colorsHold.blue ? "3px solid #878686" : "none",
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
                  border: holdTypeSelected.color === colorsHold.yellow ? "3px solid #878686" : "none",
                  outline: "none",
                  cursor: "pointer",
                  transform: holdTypeSelected.color === colorsHold.yellow ? "scale(1.2)" : "none"
                }}
                onClick={() => {
                  setHoldTypeSelected({ id: 2, color: colorsHold.yellow });
                }}
              ></button>
            </div>

            <p className="text-sm font-bold mt-4 mb-1">
              Escolha uma opcão:
            </p>
            <select
              className="w-full mb-2 p-3 pl-2 py-2 text-sm font-bold bg-white text-black border rounded-md"
              onChange={(e) => {
                setSelectedOption(e.target.value);
                if (e.target.value == "AI") {
                  setIsAllowDrawing(false);
                } else {
                  setIsAllowDrawing(true)
                }
              }}
              value={selectedOption}
            >
              <option value="AI">Selecionar com IA</option>
              <option value="Desenhar">Desenho livre</option>
            </select>

            {isAllowDrawing ?
              <button
                className={`w-full p-3 py-2 my-2 text-sm font-bold bg-gray-200 rounded-xl ${drawnLines.length === 0 && "disabled"
                  }`}
                onClick={() => {
                  setDrawnLines((prev) =>
                    prev.length > 0 ? prev.slice(0, -1) : prev
                  );
                }}
                disabled={drawnLines.length === 0}
              >
                Apagar ultimo desenho
              </button>
              :
              (
                <SegmentOptions
                  handleResetInteraction={handleResetInteraction}
                  handleUndoInteraction={handleUndoInteraction}
                  handleRedoInteraction={handleRedoInteraction}
                  handleMagicErase={handleMagicErase}
                  handleImage={handleImage}
                  hasClicked={hasClicked}
                  isCutOut={[isCutOut, setIsCutOut]}
                  handleMultiMaskMode={handleMultiMaskMode}
                />
              )}
          </div>
        </div>
    </section>
  );
};

export default SegmentDrawer;
