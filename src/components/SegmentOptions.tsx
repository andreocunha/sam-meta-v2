import React, { useContext } from "react";
import AppContext from "./hooks/createContext";

interface SegmentOptionsProps {
  handleResetInteraction: () => void;
  handleUndoInteraction: () => void;
  handleRedoInteraction: () => void;
  handleCreateSticker: () => void;
  handleMagicErase: () => void;
  handleImage: (img?: HTMLImageElement) => void;
  hasClicked: boolean;
  isCutOut: [isCutOut: boolean, setIsCutOut: (e: boolean) => void];
  handleMultiMaskMode: () => void;
}

const SegmentOptions = ({
  handleResetInteraction,
  handleUndoInteraction,
  handleRedoInteraction,
  handleCreateSticker,
  handleMagicErase,
  handleImage,
  hasClicked,
  isCutOut: [isCutOut, setIsCutOut],
  handleMultiMaskMode,
}: SegmentOptionsProps) => {
  const {
    isModelLoaded: [isModelLoaded, setIsModelLoaded],
    segmentTypes: [segmentTypes, setSegmentTypes],
    isLoading: [isLoading, setIsLoading],
    isErased: [isErased, setIsErased],
    svg: [svg, setSVG],
    clicksHistory: [clicksHistory, setClicksHistory],
    image: [image],
    isMultiMaskMode: [isMultiMaskMode, setIsMultiMaskMode],
    svgs: [svgs, setSVGs],
    clicks: [clicks, setClicks],
    showLoadingModal: [showLoadingModal, setShowLoadingModal],
    didShowAMGAnimation: [didShowAMGAnimation, setDidShowAMGAnimation],
  } = useContext(AppContext)!;
  return (
    <>
      <div
        className={`flex justify-between px-4 py-2 my-2 text-sm bg-gray-200 rounded-xl opacity-70 ${
          segmentTypes === "All" && "hidden"
        } ${isCutOut && "hidden"}`}
      >
        <button
          onClick={() => {
            if (isErased) {
              setIsErased(false);
              setIsLoading(true);
              handleImage();
            }
            setSegmentTypes("Click");
            handleResetInteraction();
          }}
          className={`${
            ((!svg && !svgs && !isErased) || segmentTypes === "All") &&
            "disabled"
          }`}
        >
          Reset
        </button>
        <button
          onClick={handleUndoInteraction}
          className={`${
            (!svg || segmentTypes === "All" || isMultiMaskMode) && "disabled"
          }`}
          id="undo-button"
        >
          <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Edit / Undo">
            <path id="Vector" d="M10 8H5V3M5.29102 16.3569C6.22284 17.7918 7.59014 18.8902 9.19218 19.4907C10.7942 20.0913 12.547 20.1624 14.1925 19.6937C15.8379 19.225 17.2893 18.2413 18.3344 16.8867C19.3795 15.5321 19.963 13.878 19.9989 12.1675C20.0347 10.4569 19.5211 8.78001 18.5337 7.38281C17.5462 5.98561 16.1366 4.942 14.5122 4.40479C12.8878 3.86757 11.1341 3.86499 9.5083 4.39795C7.88252 4.93091 6.47059 5.97095 5.47949 7.36556" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </button>
        <button
          onClick={handleRedoInteraction}
          className={`${
            (!clicksHistory?.length || segmentTypes === "All") && "disabled"
          }`}
          id="redo-button"
        >
          <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Edit / Redo">
            <path id="Vector" d="M13.9998 8H18.9998V3M18.7091 16.3569C17.7772 17.7918 16.4099 18.8902 14.8079 19.4907C13.2059 20.0913 11.4534 20.1624 9.80791 19.6937C8.16246 19.225 6.71091 18.2413 5.66582 16.8867C4.62073 15.5321 4.03759 13.878 4.00176 12.1675C3.96593 10.4569 4.47903 8.78001 5.46648 7.38281C6.45392 5.98561 7.86334 4.942 9.48772 4.40479C11.1121 3.86757 12.8661 3.86499 14.4919 4.39795C16.1177 4.93091 17.5298 5.97095 18.5209 7.36556" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </button>
      </div>
    </>
  );
};

export default SegmentOptions;
