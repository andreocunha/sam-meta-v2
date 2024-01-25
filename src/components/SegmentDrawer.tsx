import React, { useContext, useState } from "react";
import { getCookieConsentValue } from "react-cookie-consent";
import { useDropzone } from "react-dropzone";
import * as ReactGA from "react-ga4";
import Animate from "./hooks/Animation";
import AppContext from "./hooks/createContext";
import SegmentOptions from "./SegmentOptions";
import Sparkle from "./Sparkle";

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
  handleResetState,
  handleResetInteraction,
  handleUndoInteraction,
  handleRedoInteraction,
  handleCreateSticker,
  handleMagicErase,
  handleImage,
  handleMultiMaskMode,
  userNegClickBool: [userNegClickBool, setUserNegClickBool],
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

  // setIsClickMounted(false)
  // setIsBoxMounted(false)
  // setIsAllMounted(false)
  // setIsCutOutMounted(false)

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

  return (
    <section className="flex-col hidden w-1/5 pt-[6%] overflow-y-auto md:flex lg:w-72">
      <div
        className={`shadow-[0px_0px_15px_5px_#00000024] rounded-xl md:mx-1 lg:mx-5`}
      >
        <div className="p-4 pt-5">
          <div className="flex justify-between p-2 pb-3">
            <span className="leading-3">Tools</span>
          </div>
          {uploadClick && (
            <div className="flex justify-between px-3 py-2 mb-3 cursor-pointer rounded-xl outline outline-gray-200">
              <button
                className="flex"
                onClick={() => {
                  setShowGallery(true);
                  setIsCutOut(false);
                  setIsToolBarUpload(true);
                }}
              >
                <span {...getRootProps()} className="flex text-sm">
                  <input {...getInputProps()} />
                  <img src="assets/upload_arrow.svg" className="w-5 mr-1" />
                  Upload
                </span>
              </button>
              <button
                className="flex"
                onClick={() => {
                  setIsToolBarUpload(false);
                  setShowGallery(false);
                  setIsCutOut(false);
                  setDidShowAMGAnimation(false);
                  handleResetState();
                }}
              >
                <img src="assets/icn-image-gallery.svg" className="w-5 mr-1" />
                <span className="text-sm">Gallery</span>
              </button>
            </div>
          )}
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
            className={`transition-all overflow-hidden pb-2 ${
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
            <div className="flex">
              <svg
                width="17"
                height="24"
                viewBox="0 0 17 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 mr-2"
              >
                <path
                  d="M9.13635 23.8813C8.53843 24.1683 7.82091 23.9172 7.54586 23.3192L4.93889 17.6509L1.93729 20.0665C1.73399 20.2339 1.48286 20.3296 1.19586 20.3296C0.878697 20.3296 0.574526 20.2036 0.350259 19.9793C0.125992 19.7551 0 19.4509 0 19.1337V1.19586C0 0.878697 0.125992 0.574526 0.350259 0.350259C0.574526 0.125992 0.878697 0 1.19586 0C1.48286 0 1.75791 0.107627 1.96121 0.275047L1.97317 0.263089L15.7136 11.7912C16.2278 12.2217 16.2876 12.9751 15.869 13.4773C15.6897 13.6926 15.4385 13.8361 15.1874 13.8839L11.4085 14.6253L14.0394 20.2817C14.3503 20.8797 14.0633 21.5852 13.4654 21.8603L9.13635 23.8813Z"
                  fill={`${segmentTypes === "Click" ? "#2962D9" : "#000000"}`}
                />
              </svg>
              <span
                className={`font-bold ${
                  segmentTypes === "Click" && "text-blue-600"
                }`}
              >
                Click
              </span>
            </div>
            {segmentTypes === "Click" && (
              <p className={`my-3 text-[11px] text-blue-700 opacity-70`}>
                Click em uma garra ou mais para seleciona-las.
              </p>
            )}

            <div className="flex flex-row w-full justify-between">
                {/* 3 buttons to holdTypeSelected, red, blue and yellow */}
                <button
                    style={{
                        backgroundColor: "#ff1717",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        border: holdTypeSelected.color === "#ff1717" ? "3px solid #878686" : "none",
                        outline: "none",
                        cursor: "pointer",
                        transform: holdTypeSelected.color === "#ff1717" ? "scale(1.2)" : "none"
                    }}
                    onClick={() => {
                        setHoldTypeSelected({ id: 0, color: "#ff1717" });
                    }}
                ></button>
                <button
                    style={{
                        backgroundColor: "#1717ff",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        border: holdTypeSelected.color === "#1717ff" ? "3px solid #878686" : "none",
                        outline: "none",
                        cursor: "pointer",
                        transform: holdTypeSelected.color === "#1717ff" ? "scale(1.2)" : "none"
                    }}
                    onClick={() => {
                        setHoldTypeSelected({ id: 1, color: "#1717ff" });
                    }}
                ></button>
                <button
                    style={{
                        backgroundColor: "#ffff17",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        border: holdTypeSelected.color === "#ffff17" ? "3px solid #878686" : "none",
                        outline: "none",
                        cursor: "pointer",
                        transform: holdTypeSelected.color === "#ffff17" ? "scale(1.2)" : "none"
                    }}
                    onClick={() => {
                        setHoldTypeSelected({ id: 2, color: "#ffff17" });
                    }}
                ></button>
            </div>


                        
            {segmentTypes === "Click" && (
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
