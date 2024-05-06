import { useEffect, useState } from "react";
import { RouteDifficulty } from "./RouteDifficulty";
import Select from 'react-select';
import { supabase } from "../lib/initSupabase";
import { jwtDecode } from "jwt-decode";
import { InputSelectGeneric } from "./InputSelectGeneric";

interface CreateRouteModalProps {
  isOpen: boolean;
  isAdmin?: boolean;
  creatorId: string;
  onConfirm: (routerData: any) => Promise<void>;
  onCancel: () => void;
}

interface AdminListProps {
  user_id: string;
  name: string;
  photo: string;
  admin_email: string;
}

const boulderGrades = [
  { value: "", name: "Sem grau definido" },
  { value: "V0-", name: "V0-" }, { value: "V0", name: "V0" }, { value: "V0+", name: "V0+" },
  { value: "V1-", name: "V1-" }, { value: "V1", name: "V1" }, { value: "V1+", name: "V1+" },
  { value: "V2-", name: "V2-" }, { value: "V2", name: "V2" }, { value: "V2+", name: "V2+" },
  { value: "V3-", name: "V3-" }, { value: "V3", name: "V3" }, { value: "V3+", name: "V3+" },
  { value: "V4-", name: "V4-" }, { value: "V4", name: "V4" }, { value: "V4+", name: "V4+" },
  { value: "V5-", name: "V5-" }, { value: "V5", name: "V5" }, { value: "V5+", name: "V5+" },
  { value: "V6-", name: "V6-" }, { value: "V6", name: "V6" }, { value: "V6+", name: "V6+" },
  { value: "V7-", name: "V7-" }, { value: "V7", name: "V7" }, { value: "V7+", name: "V7+" },
  { value: "V8-", name: "V8-" }, { value: "V8", name: "V8" }, { value: "V8+", name: "V8+" },
  { value: "V9-", name: "V9-" }, { value: "V9", name: "V9" }, { value: "V9+", name: "V9+" },
  { value: "V10-", name: "V10-" }, { value: "V10", name: "V10" }, { value: "V10+", name: "V10+" },
  { value: "V11-", name: "V11-" }, { value: "V11", name: "V11" }, { value: "V11+", name: "V11+" },
  { value: "V12-", name: "V12-" }, { value: "V12", name: "V12" }, { value: "V12+", name: "V12+" },
  { value: "V13-", name: "V13-" }, { value: "V13", name: "V13" }, { value: "V13+", name: "V13+" },
  { value: "V14-", name: "V14-" }, { value: "V14", name: "V14" }, { value: "V14+", name: "V14+" },
  { value: "V15-", name: "V15-" }, { value: "V15", name: "V15" }, { value: "V15+", name: "V15+" },
  { value: "V16-", name: "V16-" }, { value: "V16", name: "V16" }, { value: "V16+", name: "V16+" },
  { value: "V17-", name: "V17-" }, { value: "V17", name: "V17" }, { value: "V17+", name: "V17+" },
];

const difficultyColorOptions = [
  { label: "Branca", value: "#ffffff" },
  { label: "Amarela", value: "#ffde00" },
  { label: "Verde", value: "#07b85d" },
  { label: "Azul", value: "#0095ff" },
  { label: "Vermelha", value: "#d9212a" },
  { label: "Preta", value: "#000000" },
];


const CreateRouteModal = ({ isOpen, creatorId, onConfirm, onCancel, isAdmin=false }: CreateRouteModalProps) => {
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
    creator_id: creatorId,
    removal_date: new Date().toISOString().split('T')[0]
  });

  const [adminsList, setAdminsList] = useState<AdminListProps[]>([]);
  const [loading, setLoading] = useState(false);
  

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewBoulder({ ...newBoulder, [name]: value });
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Checa se o clique foi no elemento backdrop diretamente
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  const getAdminsList = async () => {
    if(!isAdmin) return
    try {
      const { data, error } = await supabase.rpc('get_gym_admins_details',{
        id: "1058d9a4-1659-4441-8a5c-b7fe3b7a988d"
      })
      if(error) return
      setAdminsList(data)
    }
    catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if(!isAdmin) return;
    getAdminsList()
  },[])

  const resetForm = () => {
    setNewBoulder({
      wall_id: '',
      name: '',
      description: '',
      score_non_flash: 0,
      score_flash: 0,
      color: '#cccccc',
      difficulty: '',
      difficulty_color: '#ffffff',
      coordinates: {},
      creator_id: creatorId,
      removal_date: new Date().toISOString().split('T')[0]
    });
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center h-screen overflow-y-auto"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 30000,
      }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full h-full p-4 pt-6 flex flex-col items-center overflow-y-auto"
      >
        <div className="w-full"
          style={{
            maxWidth: 400,
          }}
        >
          <div className="flex flex-row w-full items-center justify-center">
            <div className="w-full flex flex-wrap gap-4 justify-between"
              style={{
                alignItems: "end",
                maxWidth: 350,
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
                <Select
                  options={difficultyColorOptions}
                  value={difficultyColorOptions.find((option) => option.value === newBoulder.difficulty_color)}
                  onChange={(option) => setNewBoulder({ ...newBoulder, difficulty_color: option?.value || '#ffffff' })}
                  className="mt-1 block w-fit h-10 border border-gray-300 rounded-md shadow-sm"
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
            <InputSelectGeneric
              value={newBoulder.difficulty}
              onChange={(value) => setNewBoulder({ ...newBoulder, difficulty: value })}
              items={boulderGrades.map(grade => grade.value)}
              placeholder="Classifique o boulder/via"  
            />
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
              maxLength={50}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
            <textarea
              id="description"
              name="description"
              value={newBoulder.description}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              style={{ resize: "none" }}
              placeholder="Ex.: Boulder com agarras pequenas e regletes"
              maxLength={200}
            />
          </div>

          {isAdmin && <div className="mt-4">
              <label htmlFor="removal_date" className="block text-sm font-medium text-neutral-800">Selecione o criador da rota</label>
              <select
                id="creator_id"
                name="creator_id"
                value={newBoulder.creator_id}
                onChange={handleChange}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm p-2"
                tabIndex={6}
              >
                {adminsList.map((admin) => (
                  <option key={admin.user_id} value={admin.user_id}>{admin.name}</option>
                ))}
              </select>
            </div>}
          
          {isAdmin && <div className="flex flex-row w-full gap-4 mt-4"
            style={{
              alignItems: "end",
              alignSelf: "center",
              justifySelf: "center",
            }}
          >
            <div className="w-full text-center"
              style={{
                maxWidth: 70,
              }}
            >
              <label htmlFor="score_flash" className="block text-sm font-medium text-gray-700">Flash (pts)</label>
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

            <div className="w-full text-center"
              style={{
                maxWidth: 100,
              }}
            >
              <label htmlFor="score_non_flash" className="block text-sm font-medium text-gray-700">Não flash (pts)</label>
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

            {/* <div
              className="w-full"
              style={{
                maxWidth: 125,
              }}
            >
              <label htmlFor="removal_date" className="block text-sm font-medium text-gray-700">Data de remoção</label>
              <input
                type="date"
                name="removal_date"
                id="removal_date"
                value={newBoulder.removal_date}
                onChange={handleChange}
                className="mt-1 p-2 block w-full h-10 border border-gray-300 rounded-md shadow-sm"
              />
            </div> */}
          </div>}
        </div>



        <div className="flex gap-4 mt-8 mb-8">
          <button
            onClick={async () => {
              setLoading(true);
              await onConfirm(newBoulder);
              setLoading(false);
              resetForm();
            }}
            className={`px-4 py-2 text-white rounded ${loading ? "disabled": ""}`}
            style={{
              backgroundColor: "#4355f6",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            onClick={onCancel}
            className={`px-4 py-2 text-white rounded ${loading ? "disabled": ""}`}
            style={{
              backgroundColor: "#6d6d6d",
          opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRouteModal;
