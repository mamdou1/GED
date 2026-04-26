import React, { useState, useRef } from "react";
import { Archive, Columns } from "lucide-react";
import { Toast } from "primereact/toast";
import BoxListe from "./BoxListe";
import BoxAffectationTravee from "./BoxAffectationTravee";

interface SelectedBox {
  boxId: string;
  boxCode: string;
  boxLibelle: string;
  current_count: number;
  capacite_max: number;
}

const BoxListeEtAffectation: React.FC = () => {
  const [selectedBoxes, setSelectedBoxes] = useState<SelectedBox[]>([]);
  const toast = useRef<Toast>(null);

  const handleBoxesChange = (boxes: SelectedBox[]) => {
    setSelectedBoxes(boxes);
  };

  const handleBoxesAffected = () => {
    setSelectedBoxes([]);
    toast.current?.show({
      severity: "success",
      summary: "Terminé",
      detail: "Les box ont été affectés avec succès",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <Toast ref={toast} />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200">
            <Columns size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Affectation des Box à une Travée
            </h1>
            <p className="text-sm text-slate-500">
              Sélectionnez les box à gauche, choisissez la travée de destination
              à droite
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal : deux colonnes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Colonne gauche : Liste des box */}
        <div className="w-1/2 border-r border-slate-200 bg-white overflow-hidden">
          <BoxListe
            selectedBoxes={selectedBoxes}
            onBoxesChange={handleBoxesChange}
          />
        </div>

        {/* Colonne droite : Filtres et affectation */}
        <div className="w-1/2 bg-white overflow-hidden">
          <BoxAffectationTravee
            selectedBoxes={selectedBoxes}
            onBoxesAffected={handleBoxesAffected}
          />
        </div>
      </div>

      {/* Footer : Résumé */}
      <div className="bg-white border-t border-slate-200 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Archive size={16} className="text-purple-500" />
            <span>
              <span className="font-bold text-purple-600">
                {selectedBoxes.length}
              </span>{" "}
              box sélectionné(s)
            </span>
            {selectedBoxes.length > 0 && (
              <span className="text-slate-400">
                |
                <span className="ml-2">
                  Capacité totale :{" "}
                  <span className="font-bold">
                    {selectedBoxes.reduce((sum, b) => sum + b.current_count, 0)}
                  </span>
                </span>
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            Site → Salle → Rayon → Travée
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxListeEtAffectation;
