import { useState } from "react";
import { RouteDifficulty } from "./RouteDifficulty";

interface CreateRouteModalProps {
  isOpen: boolean;
  isAdmin?: boolean;
  onConfirm: (routerData: any) => void;
  onCancel: () => void;
}

const boulderGrades = [
  "Sem grau definido",
  "V0-", "V0", "V0+",
  "V1-", "V1", "V1+",
  "V2-", "V2", "V2+",
  "V3-", "V3", "V3+",
  "V4-", "V4", "V4+",
  "V5-", "V5", "V5+",
  "V6-", "V6", "V6+",
  "V7-", "V7", "V7+",
  "V8-", "V8", "V8+",
  "V9-", "V9", "V9+",
  "V10-", "V10", "V10+",
  "V11-", "V11", "V11+",
  "V12-", "V12", "V12+",
  "V13-", "V13", "V13+",
  "V14-", "V14", "V14+",
  "V15-", "V15", "V15+",
  "V16-", "V16", "V16+",
  "V17-", "V17", "V17+",
];

const CreateRouteModal = ({ isOpen, onConfirm, onCancel, isAdmin=false }: CreateRouteModalProps) => {
  const [newBoulder, setNewBoulder] = useState({
    wall_id: '',
    name: '',
    description: '',
    score_non_flash: 0,
    score_flash: 0,
    color: '#cccccc',
    difficulty: '',
    difficulty_color: '#ffffff',
    coordinates: {},
    creator_id: '',
    removal_date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewBoulder({ ...newBoulder, [name]: value });
  };

  // const handleSubmit = async () => {
  //   try {
  //     setLoading(true);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Checa se o clique foi no elemento backdrop diretamente
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center h-full"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full h-full p-4 rounded-lg shadow-lg flex flex-col items-center"
        style={{
          maxWidth: "500px",
          overflowY: "auto",
          maxHeight: isAdmin ? "760px" : "520px",
        }}
      >

        <div className="w-full">
          <div className="flex flex-row w-full items-center justify-center">
            <div className="w-full flex flex-wrap gap-4 justify-between"
              style={{
                alignItems: "end",
                maxWidth: 280,
                alignSelf: "center",
                justifySelf: "center",
              }}
            >
              <RouteDifficulty
                color={newBoulder.color}
                difficulty={newBoulder.difficulty}
                difficulty_color={newBoulder.difficulty_color}
              />
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">Cor do boulder</label>
                <input
                  type="color"
                  name="color"
                  id="color"
                  value={newBoulder.color}
                  onChange={handleChange}
                  className="mt-1 block border w-full h-10 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="difficulty_color" className="block text-sm font-medium text-gray-700">Cor dificuldade</label>
                <input
                  type="color"
                  name="difficulty_color"
                  id="difficulty_color"
                  value={newBoulder.difficulty_color}
                  onChange={handleChange}
                  className="mt-1 block border w-full h-10 rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setNewBoulder({ ...newBoulder, color: '#cccccc', difficulty_color: '#ffffff' })}
          >
            Limpar cores
          </button>


          <div className="mt-4">
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Classificação da via</label>
            <select
              id="difficulty"
              name="difficulty"
              value={newBoulder.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm p-2"
            >
              {boulderGrades.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* input for name and description */}
          <div className="mt-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do boulder (opcional)</label>
            <input
              type="text"
              name="name"
              id="name"
              value={newBoulder.name}
              onChange={handleChange}
              className="mt-1 p-2 block w-full h-10 border border-gray-300 rounded-md shadow-sm"
              placeholder="Ex.: Boulder do João"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
            <textarea
              id="description"
              name="description"
              value={newBoulder.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              style={{ resize: "none" }}
              placeholder="Ex.: Boulder com agarras pequenas e regletes"
            />
          </div>
          
          {isAdmin && <div className="flex flex-col w-full gap-4 mt-4">
            <div className="w-full">
              <label htmlFor="score_flash" className="block text-sm font-medium text-gray-700">Pontuação flash</label>
              <input
                type="number"
                name="score_flash"
                id="score_flash"
                value={newBoulder.score_flash}
                onChange={handleChange}
                className="mt-1 p-2 block w-full h-10 border border-gray-300 rounded-md shadow-sm"
                placeholder="Ex.: 100"
              />
            </div>

            <div>
              <label htmlFor="score_non_flash" className="block text-sm font-medium text-gray-700">Pontuação não flash</label>
              <input
                type="number"
                name="score_non_flash"
                id="score_non_flash"
                value={newBoulder.score_non_flash}
                onChange={handleChange}
                className="mt-1 p-2 block w-full h-10 border border-gray-300 rounded-md shadow-sm"
                placeholder="Ex.: 100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="removal_date" className="block text-sm font-medium text-gray-700">Data de remoção</label>
                <input
                  type="date"
                  name="removal_date"
                  id="removal_date"
                  value={newBoulder.removal_date}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full h-10 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>}
        </div>



        <div className="flex gap-4 mt-8">
          <button
            onClick={() => onConfirm(newBoulder)}
            className="px-4 py-2 text-white rounded"
            style={{
              backgroundColor: "#4355f6",
            }}
          >
            Salvar
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

export default CreateRouteModal;
