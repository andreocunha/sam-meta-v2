import { useContext } from "react";
import AppContext from "./hooks/createContext";
import SegmentOptions from "./SegmentOptions";
import { colorsHold } from "./hooks/createContext";


interface SegmentDrawerProps {
  handleResetState: () => void;
  handleResetInteraction: (flag?: boolean) => void;
  handleUndoInteraction: () => void;
  handleRedoInteraction: () => void;
}

function showTemporaryMessage(message: string) {
  const messageElement = document.getElementById('tempMessage');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    messageElement.classList.add('fade-in');

    setTimeout(() => {
      messageElement!.style.display = 'none';
    }, 2500);
  }
}


const SegmentDrawer = ({
  handleResetInteraction,
  handleUndoInteraction,
  handleRedoInteraction,
}: SegmentDrawerProps) => {
  const {
    holdTypeSelected: [holdTypeSelected, setHoldTypeSelected],
    isAllowDrawing: [isAllowDrawing, setIsAllowDrawing],
  } = useContext(AppContext)!;

  return (
    <section
      className="absolute bottom-0 z-30 flex flex-row w-fit bg-white rounded-xl items-center justify-between"
      style={{ backgroundColor: 'rgba(184, 184, 184, 0.7)', maxWidth: '400px', height: 50, bottom: 0 }}
    >
      <div id="tempMessage" className="temp-message">Mensagem Temporária</div>
      <div className="flex flex-row w-fit items-center justify-center px-2 gap-2">
        <button
          onClick={() => {
            showTemporaryMessage('Click na garra');
            setIsAllowDrawing(false);
          }}
          className="w-10 h-10 bg-white rounded-md"
          style={!isAllowDrawing ? { border: "3px solid #33ff00" } : {border: "3px solid #7c7c7c"}}
        >
          <img src="/assets/touch.svg" alt="Touch" className="w-full h-auto" />
        </button>
        <button
          onClick={() => {
            showTemporaryMessage('Desenho livre');
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
            backgroundColor: `rgba(255, 44, 44, 0.4)`,
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            border: holdTypeSelected.color === colorsHold.red ? `3px solid ${colorsHold.red}` : "none",
            outline: "none",
            cursor: "pointer",
            transform: holdTypeSelected.color === colorsHold.red ? "scale(1.2)" : "none"
          }}
          className="flex items-center justify-center"
          onClick={() => {
            showTemporaryMessage('Início/Fim');
            setHoldTypeSelected({ id: 0, color: colorsHold.red });
          }}
        >
          <img src="/assets/flag.svg" alt="Flag" className="w-4 h-4" />
        </button>
        <button
          style={{
            backgroundColor: "rgba(0, 187, 255, 0.4)",
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            border: holdTypeSelected.color === colorsHold.blue ? `3px solid ${colorsHold.blue}` : "none",
            outline: "none",
            cursor: "pointer",
            transform: holdTypeSelected.color === colorsHold.blue ? "scale(1.2)" : "none"
          }}
          className="flex items-center justify-center"
          onClick={() => {
            showTemporaryMessage('Meio (mão e pé)');
            setHoldTypeSelected({ id: 1, color: colorsHold.blue });
          }}
        >
          <img src="/assets/hand.svg" alt="Hand" className="w-5 h-5" />
        </button>
        <button
          style={{
            backgroundColor: "rgba(255, 255, 0, 0.4)",
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            border: holdTypeSelected.color === colorsHold.yellow ? `3px solid ${colorsHold.yellow}` : "none",
            outline: "none",
            cursor: "pointer",
            transform: holdTypeSelected.color === colorsHold.yellow ? "scale(1.2)" : "none"
          }}
          className="flex items-center justify-center"
          onClick={() => {
            showTemporaryMessage('Somente pé');
            setHoldTypeSelected({ id: 2, color: colorsHold.yellow });
          }}
        >
          <img src="/assets/foot.svg" alt="Foot" className="w-5 h-5" />
        </button>
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
