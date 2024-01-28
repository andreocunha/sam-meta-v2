import React, { useContext, useState } from "react";
import { getCookieConsentValue } from "react-cookie-consent";
import { useDropzone } from "react-dropzone";
import * as ReactGA from "react-ga4";
import AppContext from "./hooks/createContext";
import SegmentOptions from "./SegmentOptions";
import { colorsHold } from "./hooks/createContext";


interface SegmentDrawerProps {
  handleResetState: () => void;
  handleResetInteraction: (flag?: boolean) => void;
  handleUndoInteraction: () => void;
  handleRedoInteraction: () => void;
  handleCreateSticker: () => void;
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
  handleCreateSticker,
  handleMagicErase,
  handleImage,
  handleMultiMaskMode,
  showGallery: [showGallery, setShowGallery],
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
  const handleStickerClick = (i: number) => {
    setActiveSticker(i);
  };
  const [error, setError] = useState<string>("");
  const [isClickCollapsed, setIsClickCollapsed] = useState(true);
  const [isBoxCollapsed, setIsBoxCollapsed] = useState(true);
  const [isAllCollapsed, setIsAllCollapsed] = useState(true);
  const [isCutOutCollapsed, setIsCutOutCollapsed] = useState(true);
  const [isClickMounted, setIsClickMounted] = useState(false);
  const [isBoxMounted, setIsBoxMounted] = useState(false);
  const [isAllMounted, setIsAllMounted] = useState(false);
  const [isCutOutMounted, setIsCutOutMounted] = useState(false);
  let clickTimeout: string | number | NodeJS.Timeout | undefined,
    boxTimeout: string | number | NodeJS.Timeout | undefined,
    allTimeout: string | number | NodeJS.Timeout | undefined,
    cutOutTimeout: string | number | NodeJS.Timeout | undefined;

  const [minimize, setMinimize] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("IA");

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    onDrop: (acceptedFile) => {
      try {
        if (acceptedFile.length === 0) {
          setError("File not accepted! Try again.");
          return;
        }
        if (acceptedFile.length > 1) {
          setError("Too many files! Try again with 1 file.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          handleSelectedImage(acceptedFile[0]);
        };
        reader.readAsDataURL(acceptedFile[0]);
      } catch (error) {
        console.log(error);
      }
    },
    maxSize: 50_000_000,
  });

  // return small circle on top left of screen
  if(minimize) {
    return (
      <div 
        onClick={() => setMinimize(false)}
        style={{
          position: "absolute",
          top: "5px",
          left: "5px",
          zIndex: 30,
          backgroundColor: "#ffffff",
          borderRadius: "50%",
          width: "35px",
          height: "35px",
          display: "flex",
          border: "1px solid #878686",
          padding: "7px",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 122.6 122.88"><g><path d="M110.6,72.58c0-3.19,2.59-5.78,5.78-5.78c3.19,0,5.78,2.59,5.78,5.78v33.19c0,4.71-1.92,8.99-5.02,12.09 c-3.1,3.1-7.38,5.02-12.09,5.02H17.11c-4.71,0-8.99-1.92-12.09-5.02c-3.1-3.1-5.02-7.38-5.02-12.09V17.19 C0,12.48,1.92,8.2,5.02,5.1C8.12,2,12.4,0.08,17.11,0.08h32.98c3.19,0,5.78,2.59,5.78,5.78c0,3.19-2.59,5.78-5.78,5.78H17.11 c-1.52,0-2.9,0.63-3.91,1.63c-1.01,1.01-1.63,2.39-1.63,3.91v88.58c0,1.52,0.63,2.9,1.63,3.91c1.01,1.01,2.39,1.63,3.91,1.63h87.95 c1.52,0,2.9-0.63,3.91-1.63s1.63-2.39,1.63-3.91V72.58L110.6,72.58z M112.42,17.46L54.01,76.6c-2.23,2.27-5.89,2.3-8.16,0.07 c-2.27-2.23-2.3-5.89-0.07-8.16l56.16-56.87H78.56c-3.19,0-5.78-2.59-5.78-5.78c0-3.19,2.59-5.78,5.78-5.78h26.5 c5.12,0,11.72-0.87,15.65,3.1c2.48,2.51,1.93,22.52,1.61,34.11c-0.08,3-0.15,5.29-0.15,6.93c0,3.19-2.59,5.78-5.78,5.78 c-3.19,0-5.78-2.59-5.78-5.78c0-0.31,0.08-3.32,0.19-7.24C110.96,30.94,111.93,22.94,112.42,17.46L112.42,17.46z"/></g></svg>
      </div>
    );
  }

  return (
    <section className="absolute top-0 left-0 z-30 flex-col flex w-full lg:w-72 overflow-y-auto bg-white"
    style={{
      top: "20px"
    }}
    >
      <div
        className={`shadow-[0px_0px_15px_5px_#00000024] rounded-xl md:mx-1 lg:mx-5`}
      >
        <div className="p-4 pt-5">
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
            className={`relative transition-all overflow-hidden pb-2 ${
              segmentTypes !== "Click" &&
              (isClickCollapsed ? "max-h-[40px]" : "max-h-[85px]")
            } px-3 py-2 cursor-pointer rounded-xl ${
              segmentTypes === "Click"
                ? "outline-blue-700 outline outline-[2.5px]"
                : "outline outline-gray-200 "
            } ${isCutOut && "hidden"}`}
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
            {/* button to minimize */}
            <button className="absolute top-0 right-0 z-50 p-2 cursor-pointer" onClick={() => setMinimize(true)}>
              <svg fill="#000000" height="15px" width="15px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330">
              <g>
                <path d="M315,0H15C6.716,0,0,6.716,0,15v300c0,8.284,6.716,15,15,15h300c8.284,0,15-6.716,15-15V15C330,6.716,323.284,0,315,0z
                  M300,300H30V30h270V300z"/>
                <path d="M95,180h140c8.284,0,15-6.716,15-15s-6.716-15-15-15H95c-8.284,0-15,6.716-15,15S86.716,180,95,180z"/>
              </g>
              </svg>
            </button>

            {/* {segmentTypes === "Click" && (
              <p className={`my-3 text-sm text-blue-700 opacity-70`}>
                Click em uma garra ou mais para seleciona-las com IA
              </p>
            )} */}

            <p className="text-sm font-bold mt-4 mb-1">
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
                className={`w-full p-3 py-2 my-2 text-sm font-bold bg-gray-200 rounded-xl ${
                  drawnLines.length === 0 && "disabled"
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
                handleCreateSticker={handleCreateSticker}
                handleMagicErase={handleMagicErase}
                handleImage={handleImage}
                hasClicked={hasClicked}
                isCutOut={[isCutOut, setIsCutOut]}
                handleMultiMaskMode={handleMultiMaskMode}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SegmentDrawer;
