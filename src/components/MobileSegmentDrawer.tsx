import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-daisyui";
import { useSwipeable } from "react-swipeable";
import AppContext from "./hooks/createContext";
import Sparkle from "./Sparkle";

interface MobileSegmentDrawerProps {
  handleResetInteraction: () => void;
  handleMagicErase: () => void;
  handleCreateSticker: () => void;
  userNegClickBool: [
    userNegClickBool: boolean,
    setUserNegClickBool: (e: boolean) => void
  ];
}

const MobileSegmentDrawer = ({
  handleResetInteraction,
  handleMagicErase,
  handleCreateSticker,
  userNegClickBool: [userNegClickBool, setUserNegClickBool],
}: MobileSegmentDrawerProps) => {
  const {
    segmentTypes: [segmentTypes, setSegmentTypes],
    svg: [svg, setSVG],
    stickers: [stickers, setStickers],
    activeSticker: [activeSticker, setActiveSticker],
    isModelLoaded: [isModelLoaded, setIsModelLoaded],
    click: [click, setClick],
    clicks: [clicks, setClicks],
    stickerTabBool: [stickerTabBool, setStickerTabBool],
    allsvg: [allsvg, setAllsvg],
    didShowAMGAnimation: [didShowAMGAnimation, setDidShowAMGAnimation],
    showLoadingModal: [showLoadingModal, setShowLoadingModal],
  } = useContext(AppContext)!;
  const [everythingBool, setEverythingBool] = useState<Boolean>(false);
  const [hasTouchedErase, sethasTouchedErase] = useState<Boolean>(false);

  useEffect(() => {
    setEverythingBool(segmentTypes === "All");
  }, [segmentTypes]);

  useEffect(() => {
    setStickerTabBool(() => false);
  }, [click]);

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

  const handleStickerClick = (i: number) => {
    setActiveSticker(i);
  };

  const handlers = useSwipeable({
    onSwipedUp: () => setStickerTabBool(true),
    onSwipedDown: () => setStickerTabBool(false),
    swipeDuration: 200,
    delta: 5,
    preventScrollOnSwipe: true,
  });

  return (
    <div
      className={`z-40 relative shadow-[0px_0px_20px_10px_#00000024] bg-white ease-in-out duration-300 items-center md:hidden rounded-t-3xl text-center ${
        stickerTabBool ? " -translate-y-72" : ""
      }`}
    >
      <div className="absolute w-full bg-white h-[17rem] mt-[-1px]">
        <div className="h-full pb-8 m-5 mb-0 overflow-auto bg-white">
          <Button
            size="md"
            className={`flex flex-row-reverse normal-case border-none mt-5 mx-auto bg-gray-300 ${
              !everythingBool && !svg && "disabled"
            }`}
            onClick={(e) => {
              e.currentTarget.blur();
              handleCreateSticker();
            }}
          >
            <div className="leading-normal text-black active:text-white hover:text-white">
              {everythingBool ? "Cut out all objects" : "Create cut-out"}
            </div>
            <svg
              className="mr-2"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7895 0H13.4737V2.52632H16V4.21053H13.4737V6.73684H11.7895V4.21053H9.26316V2.52632H11.7895V0ZM3.36842 2.52632H6.73684V4.21053H3.36842C2.44211 4.21053 1.68421 4.96842 1.68421 5.89474V12.6316C1.68421 13.5663 2.44211 14.3158 3.36842 14.3158H10.1053C11.04 14.3158 11.7895 13.5663 11.7895 12.6316V9.26316H13.4737V12.6316C13.4737 14.4926 11.9663 16 10.1053 16H3.36842C1.50737 16 0 14.4926 0 12.6316V5.89474C0 4.03368 1.50737 2.52632 3.36842 2.52632Z"
                fill="black"
              />
            </svg>
          </Button>
          <div className="mt-5">
            {stickers.map((el: HTMLCanvasElement, i) => (
              <img
                key={i}
                className={`m-5 max-w-[75%] max-h-20 md:max-h-24 lg:max-h-28 xl:max-h-32 cursor-pointer inline hover:opacity-100 ${
                  stickers.length === 1 || i === activeSticker
                    ? "sticker-select"
                    : ""
                }`}
                alt="cutout"
                src={el.toDataURL()}
                onClick={(e) => handleStickerClick(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSegmentDrawer;
