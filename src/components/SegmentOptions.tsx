import { useContext, useState } from "react";
import AppContext from "./hooks/createContext";
import ConfirmationModal from "./ConfirmationModal";

interface SegmentOptionsProps {
  handleResetInteraction: () => void;
  handleUndoInteraction: () => void;
  handleRedoInteraction: () => void;
  handleSaveInteraction: () => void;
  // type AI or Draw
  type?: 'AI' | 'Draw';
}

const SegmentOptions = ({
  handleResetInteraction,
  handleUndoInteraction,
  handleRedoInteraction,
  handleSaveInteraction,
  type,
}: SegmentOptionsProps) => {
  const {
    svg: [svg, setSVG],
    clicksHistory: [clicksHistory, setClicksHistory],
    drawnLines: [drawnLines, setDrawnLines],
    drawnLinesHistory: [drawnLinesHistory, setDrawnLinesHistory],
    allSvg: [allSvg, setAllSvg],
  } = useContext(AppContext)!;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openConfirmationModal = () => {
    // Define as ações do modal aqui, se necessário
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className={`flex flex-col justify-between w-fit px-2 py-2 gap-1 text-sm bg-gray-300 rounded-xl`}
        style={{
          color: "black",
          opacity: 0.8,
        }}
      >     
        <button
          onClick={handleSaveInteraction}
          className={`flex flex-row w-fit h-fit px-2 py-2 gap-2 rounded-xl items-center justify-center text-sm hover:bg-gray-400 cursor-pointer border bg-gray-400 rounded-lg p-2 ${(allSvg && allSvg?.length > 0 ) ? "" : "disabled"}`}
        >
          <img src="/assets/save.svg" alt="Save" className="w-4 h-4" />
          <p>Salvar</p>
        </button>   
        <div className="w-full flex flex-row gap-1 justify-between">
          <button
            onClick={handleUndoInteraction}
            className={`border bg-gray-400 rounded-lg p-2 ${
              type === "AI" ?
              (!svg) && "disabled"
              : (!drawnLines?.length) && "disabled"
            }`}
            id="undo-button"
          >
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="Edit / Undo">
              <path id="Vector" d="M10 8H5V3M5.29102 16.3569C6.22284 17.7918 7.59014 18.8902 9.19218 19.4907C10.7942 20.0913 12.547 20.1624 14.1925 19.6937C15.8379 19.225 17.2893 18.2413 18.3344 16.8867C19.3795 15.5321 19.963 13.878 19.9989 12.1675C20.0347 10.4569 19.5211 8.78001 18.5337 7.38281C17.5462 5.98561 16.1366 4.942 14.5122 4.40479C12.8878 3.86757 11.1341 3.86499 9.5083 4.39795C7.88252 4.93091 6.47059 5.97095 5.47949 7.36556" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            </svg>
          </button>
          <button
            onClick={handleRedoInteraction}
            className={`border bg-gray-400 rounded-lg p-2 ${
              type === "AI" ?
              (!clicksHistory?.length) && "disabled"
              : (!drawnLinesHistory?.length) && "disabled"
            }`}
            id="redo-button"
          >
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="Edit / Redo">
              <path id="Vector" d="M13.9998 8H18.9998V3M18.7091 16.3569C17.7772 17.7918 16.4099 18.8902 14.8079 19.4907C13.2059 20.0913 11.4534 20.1624 9.80791 19.6937C8.16246 19.225 6.71091 18.2413 5.66582 16.8867C4.62073 15.5321 4.03759 13.878 4.00176 12.1675C3.96593 10.4569 4.47903 8.78001 5.46648 7.38281C6.45392 5.98561 7.86334 4.942 9.48772 4.40479C11.1121 3.86757 12.8661 3.86499 14.4919 4.39795C16.1177 4.93091 17.5298 5.97095 18.5209 7.36556" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            </svg>
          </button>
        </div>
        <button
          onClick={openConfirmationModal}
          className={`flex flex-row w-fit h-fit px-2 py-2 gap-2 rounded-xl items-center justify-center text-sm hover:bg-gray-400 cursor-pointer border bg-gray-400 rounded-lg p-2 ${
            (type === "AI" && !svg) || (type === "Draw" && !drawnLines?.length) ?
            "disabled"
            : ""
          }`}
        >
          <img src="/assets/trash.svg" alt="Trash" className="w-4 h-4" />
          Limpar
        </button>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        message="Deseja mesmo limpar tudo?"
        onConfirm={() => {
          handleResetInteraction();
          setIsModalOpen(false);
        }}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SegmentOptions;
