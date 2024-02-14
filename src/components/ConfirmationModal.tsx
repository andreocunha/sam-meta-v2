interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }: ConfirmationModalProps) => {
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Checa se o clique foi no elemento backdrop diretamente
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex justify-center items-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
        <p>{message}</p>
        <div className="mt-4 flex gap-4">
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-white rounded"
            style={{
              backgroundColor: "#f44336",
            }}
          >
            Confirmar
          </button>
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-white rounded"
            style={{
              backgroundColor: "#6d6d6d",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
