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
        >
          Undo
        </button>
        <button
          onClick={handleRedoInteraction}
          className={`${
            (!clicksHistory?.length || segmentTypes === "All") && "disabled"
          }`}
        >
          Redo
        </button>
      </div>
    </>
  );
};

export default SegmentOptions;
