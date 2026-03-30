import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { TypeDocument } from "../../interfaces";
import { ArrowRight, ArrowLeft, CheckCircle2, Info } from "lucide-react";

type Props = {
  // visible est maintenant optionnel car le TabView gère l'affichage
  visible?: boolean;
  onHide: () => void;
  onSubmit: (typeIds: string[]) => Promise<void>;
  types: TypeDocument[];
  structureLabel: string;
  isFiltered: boolean;
};

export default function DocumentTypeMultipleAffectation({
  visible,
  onHide,
  onSubmit,
  types,
  structureLabel,
  isFiltered,
}: Props) {
  const [availableTypes, setAvailableTypes] = useState<TypeDocument[]>([]);
  const [selectedToAssign, setSelectedToAssign] = useState<TypeDocument[]>([]);
  const [checkedAvailable, setCheckedAvailable] = useState<string[]>([]);
  const [checkedSelected, setCheckedSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // On déclenche l'initialisation si visible est true OU si le composant est monté dans un onglet actif
  // useEffect(() => {
  //   if (!types || !Array.isArray(types)) return;

  //   // FILTRAGE BASÉ SUR TES LOGS CONSOLE
  //   const orphans = types.filter((t) => {
  //     // D'après tes logs, les orphelins ont structure_libelle === "Non assigné"
  //     // ou entitee_un === null
  //     return (
  //       t.structure_libelle === "Non assigné" ||
  //       !t.entitee_un ||
  //       t.entitee_un === null
  //     );
  //   });

  //   setAvailableTypes(orphans);
  //   setSelectedToAssign([]);
  //   setCheckedAvailable([]);
  //   setCheckedSelected([]);
  // }, [types, visible]);

  useEffect(() => {
    if (!types || !Array.isArray(types)) return;

    // 1. Filtrer les ORPHELINS (colonne de gauche)
    const orphans = types.filter((t) => {
      return (
        t.structure_libelle === "Non assigné" ||
        !t.entitee_un ||
        t.entitee_un === null
      );
    });

    // 2. Filtrer les DÉJÀ ASSIGNÉS à cette structure (colonne de droite)
    // On compare avec structureLabel qui vient du Dropdown parent
    const alreadyAssigned = types.filter((t) => {
      return isFiltered && t.structure_libelle === structureLabel;
    });

    setAvailableTypes(orphans);
    setSelectedToAssign(alreadyAssigned); // On remplit la colonne de droite

    // Reset des sélections (checkboxes)
    setCheckedAvailable([]);
    setCheckedSelected([]);
  }, [types, visible, structureLabel, isFiltered]);

  const moveRight = () => {
    const toMove = availableTypes.filter((t) =>
      checkedAvailable.includes(String(t.id)),
    );
    setSelectedToAssign([...selectedToAssign, ...toMove]);
    setAvailableTypes(
      availableTypes.filter((t) => !checkedAvailable.includes(String(t.id))),
    );
    setCheckedAvailable([]);
  };

  const moveLeft = () => {
    const toMove = selectedToAssign.filter((t) =>
      checkedSelected.includes(String(t.id)),
    );
    setAvailableTypes([...availableTypes, ...toMove]);
    setSelectedToAssign(
      selectedToAssign.filter((t) => !checkedSelected.includes(String(t.id))),
    );
    setCheckedSelected([]);
  };

  const handleConfirm = async () => {
    if (selectedToAssign.length === 0) return;
    setLoading(true);
    try {
      const ids = selectedToAssign.map((t) => String(t.id));
      await onSubmit(ids);
      // On ne ferme pas forcément ici si on veut rester dans le TabView,
      // mais on suit ta logique initiale :
      onHide();
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (
    t: TypeDocument,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => (
    <div
      key={t.id}
      className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-none transition-colors"
    >
      <Checkbox
        inputId={String(t.id)}
        onChange={(e) => {
          if (e.checked) setList([...list, String(t.id)]);
          else setList(list.filter((id) => id !== String(t.id)));
        }}
        checked={list.includes(String(t.id))}
        className="border border-blue-100 border-3xl"
      />
      <label
        htmlFor={String(t.id)}
        className="text-sm font-semibold text-slate-700 cursor-pointer flex-1"
      >
        <span className="text-xs font-black text-emerald-600 mr-2">
          [{t.cote}]
        </span>
        {t.nom}
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      {isFiltered ? (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
          <Info size={18} className="text-amber-600" />
          <p className="text-sm text-amber-900">
            Les éléments sélectionnés seront rattachés à :{" "}
            <span className="font-bold underline">{structureLabel}</span>
          </p>
        </div>
      ) : (
        <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-bold">
          ⚠️ Veuillez d'abord sélectionner une structure dans le filtre de la
          page principale.
        </div>
      )}

      <div className="grid grid-cols-11 gap-4">
        <div className="col-span-5 flex flex-col">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            Types disponibles (Sans structure)
          </label>
          <div className="h-[350px] border-2 border-slate-100 rounded-2xl overflow-y-auto bg-white shadow-inner">
            {availableTypes.map((t) =>
              renderItem(t, checkedAvailable, setCheckedAvailable),
            )}
            {availableTypes.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic p-4 text-center">
                Aucun type orphelin trouvé
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-3 items-center justify-center">
          <Button
            icon={<ArrowRight size={18} />}
            onClick={moveRight}
            disabled={checkedAvailable.length === 0 || !isFiltered}
            className="p-button-rounded bg-emerald-600 text-emerald-50 border-none w-10 h-10 shadow-lg shadow-emerald-100"
          />
          <Button
            icon={<ArrowLeft size={18} />}
            onClick={moveLeft}
            disabled={checkedSelected.length === 0}
            className="p-button-rounded bg-slate-200 text-slate-600 border-none w-10 h-10"
          />
        </div>

        <div className="col-span-5 flex flex-col">
          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 px-1">
            Documents rattachés à {structureLabel}
          </label>
          <div className="h-[350px] border-2 border-emerald-50 rounded-2xl overflow-y-auto bg-emerald-50/20 shadow-inner">
            {selectedToAssign.map((t) =>
              renderItem(t, checkedSelected, setCheckedSelected),
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button
          label="Annuler"
          onClick={onHide}
          className="p-button-text text-slate-400 font-bold"
        />
        <Button
          label={
            loading
              ? "Traitement..."
              : `Affecter ${selectedToAssign.length} document(s)`
          }
          icon={<CheckCircle2 size={18} className="mr-2" />}
          onClick={handleConfirm}
          disabled={selectedToAssign.length === 0 || loading || !isFiltered}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
        />
      </div>
    </div>
  );
}
