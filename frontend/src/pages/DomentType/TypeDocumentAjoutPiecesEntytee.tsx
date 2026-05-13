import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import {
  TypeDocument,
  Pieces,
  AddPiecesToTypeDocumentPayload,
} from "../../interfaces";
import {
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  List,
  CheckSquare,
  Search,
} from "lucide-react";
import { getEffectivePiecesForEntity } from "../../api/typeDocument";

type EntityType =
  | "direction"
  | "sous_direction"
  | "division"
  | "service"
  | "section";

// TypeDocumentAjoutPieces.tsx
interface Props {
  visible: boolean;
  onHide: () => void;

  onSubmit: (
    typeId: string,
    payload: AddPiecesToTypeDocumentPayload,
  ) => Promise<void>;

  // ✅ Rendre ces props optionnelles avec des valeurs par défaut
  onAddEntityPiece?: (
    entityType: EntityType,
    entityId: number,
    pieceId: number,
  ) => Promise<void>;

  onRemoveEntityPiece?: (
    entityType: EntityType,
    entityId: number,
    pieceId: number,
  ) => Promise<void>;

  entityType?: EntityType;
  entityId?: number;

  initial: any;
  pieces: Pieces[];
}

export default function TypeDocumentAjoutPiecesEntytee({
  visible,
  onHide,
  onSubmit,
  initial = null,
  pieces,
  entityType,
  entityId,
  onAddEntityPiece,
  onRemoveEntityPiece,
}: Props) {
  // Liste des pièces disponibles (à gauche)
  const [availablePieces, setAvailablePieces] = useState<Pieces[]>([]);
  const [filteredAvailable, setFilteredAvailable] = useState<Pieces[]>([]);
  // Liste des pièces affectées (à droite)
  const [assignedPieces, setAssignedPieces] = useState<Pieces[]>([]);

  // États pour les checkbox de sélection temporaire
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [effectiveAssignedPieces, setEffectiveAssignedPieces] = useState<
    Pieces[]
  >([]);
  const [effectiveAvailablePieces, setEffectiveAvailablePieces] = useState<
    Pieces[]
  >([]);

  // useEffect(() => {
  //   if (visible && initial) {
  //     //const alreadyLinkedIds = new Set(initial.pieces?.map((p) => p.id) || []);

  //     const alreadyLinkedIds = new Set(
  //       (initial.pieces as Pieces[] | undefined)?.map((p: Pieces) => p.id) ||
  //         [],
  //     );

  //     const assigned = pieces.filter((p) => alreadyLinkedIds.has(p.id));
  //     const available = pieces.filter((p) => !alreadyLinkedIds.has(p.id));

  //     setAssignedPieces(assigned);
  //     setAvailablePieces(available);
  //     setSelectedAvailable([]);
  //     setSelectedAssigned([]);
  //     setSearchQuery("");
  //   }
  // }, [visible, initial, pieces]);

  useEffect(() => {
    if (visible && initial?.id && entityType && entityId && entityId > 0) {
      // Charger les pièces effectives depuis le backend
      getEffectivePiecesForEntity(String(initial.id), entityType, entityId)
        .then(({ basePieces, addedPieces, removedPieceIds }) => {
          // Pièces assignées = pièces de base + ajouts - retraits
          const assigned = [...basePieces, ...addedPieces].filter(
            (p) => !removedPieceIds.includes(Number(p.id)),
          );

          // Pièces disponibles = toutes les pièces - pièces assignées
          const available = pieces.filter(
            (p) => !assigned.some((assigned) => assigned.id === p.id),
          );

          setAssignedPieces(assigned);
          setAvailablePieces(available);
        })
        .catch(console.error);
    }
  }, [visible, initial, pieces, entityType, entityId]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredAvailable(
        availablePieces.filter((p) =>
          p.libelle.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFilteredAvailable(availablePieces);
    }
  }, [availablePieces, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const moveRight = () => {
    const toMove = availablePieces.filter((p) =>
      selectedAvailable.includes(p.id),
    );

    setAssignedPieces((prev) => [...prev, ...toMove]);

    setAvailablePieces((prev) =>
      prev.filter((p) => !selectedAvailable.includes(p.id)),
    );

    setSelectedAvailable([]);
  };

  const moveLeft = () => {
    const toMove = assignedPieces.filter((p) =>
      selectedAssigned.includes(p.id),
    );

    setAvailablePieces((prev) => [...prev, ...toMove]);

    setAssignedPieces((prev) =>
      prev.filter((p) => !selectedAssigned.includes(p.id)),
    );

    setSelectedAssigned([]);
  };

  const handleSubmit = async () => {
    if (!initial?.id) return;

    setLoading(true);

    try {
      // Mode entité spécifique
      if (entityType && entityId) {
        // ⚠️ IMPORTANT :
        // initial.pieces contient uniquement les pièces globales du type de document.
        // assignedPieces contient les pièces effectives :
        //   basePieces + addedPieces - removedPieceIds
        //
        // Si on compare assignedPieces à initial.pieces,
        // les pièces globales apparaissent à tort comme "nouvelles",
        // ce qui provoque leur duplication.

        // 1. Charger l'état effectif réel depuis le backend
        const { basePieces, addedPieces, removedPieceIds } =
          await getEffectivePiecesForEntity(
            String(initial.id),
            entityType,
            entityId,
          );

        // 2. Construire l'état initial effectif (sans doublons)
        const initialEffectivePieces = [...basePieces, ...addedPieces]
          .filter((p) => !removedPieceIds.includes(Number(p.id)))
          .filter(
            (piece, index, array) =>
              array.findIndex((x) => Number(x.id) === Number(piece.id)) ===
              index,
          );

        // 3. Ensembles d'IDs
        const initialIds = new Set(
          initialEffectivePieces.map((p) => Number(p.id)),
        );

        const finalIds = new Set(assignedPieces.map((p) => Number(p.id)));

        // 4. Différences
        const toAdd = assignedPieces.filter(
          (p) => !initialIds.has(Number(p.id)),
        );

        const toRemove = initialEffectivePieces.filter(
          (p) => !finalIds.has(Number(p.id)),
        );

        // 5. Ajouts spécifiques
        if (onAddEntityPiece) {
          for (const piece of toAdd) {
            await onAddEntityPiece(entityType, entityId, Number(piece.id));
          }
        }

        // 6. Suppressions spécifiques
        if (onRemoveEntityPiece) {
          for (const piece of toRemove) {
            await onRemoveEntityPiece(entityType, entityId, Number(piece.id));
          }
        }
      } else {
        // Mode global : modification du type de document
        await onSubmit(String(initial.id), {
          pieces: assignedPieces.map((p) => ({
            piece: p.id,
            disponible: false,
          })),
        });
      }

      onHide();
    } finally {
      setLoading(false);
    }
  };

  // Rendu d'une ligne de pièce avec Checkbox
  const renderPieceItem = (
    p: Pieces,
    selectedList: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) => (
    <div
      key={p.id}
      className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-none transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        inputId={p.id}
        onChange={(e) => {
          e.stopPropagation();
          if (e.checked) {
            setSelected([...selectedList, p.id]);
          } else {
            setSelected(selectedList.filter((id) => id !== p.id));
          }
        }}
        checked={selectedList.includes(p.id)}
        className="border border-blue-200"
      />
      <label
        htmlFor={p.id}
        className="text-sm font-medium text-slate-700 cursor-pointer flex-1"
        onClick={(e) => e.stopPropagation()}
      >
        {p.libelle}
      </label>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-slate-800">
          <PlusCircle className="text-blue-600" size={20} />
          <span className="font-bold">
            Composition du Dossier : {initial?.nom}
          </span>
        </div>
      }
      visible={visible}
      style={{ width: "1000px" }}
      onHide={onHide}
      draggable={false}
      className="rounded-2xl"
    >
      <div className="pt-4">
        {/* Barre de recherche */}
        <div className="mb-4 px-1">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher une pièce..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Zone principale avec les deux listes */}
        <div className="flex gap-4 h-[450px]">
          {/* Liste des pièces disponibles (gauche) */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <List size={16} className="text-slate-500" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Pièces disponibles ({filteredAvailable.length})
              </span>
            </div>
            <div className="flex-1 border-2 border-slate-200 rounded-2xl overflow-y-auto bg-white shadow-inner">
              {filteredAvailable.length > 0 ? (
                filteredAvailable.map((p) =>
                  renderPieceItem(p, selectedAvailable, setSelectedAvailable),
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <span className="text-sm italic">
                    {searchQuery
                      ? "Aucune pièce ne correspond à votre recherche"
                      : "Aucune pièce disponible"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Boutons de transfert */}
          <div className="flex flex-col gap-4 items-center justify-center px-2">
            <Button
              icon={<ArrowRight size={20} />}
              onClick={moveRight}
              disabled={selectedAvailable.length === 0}
              className={`p-3 rounded-full shadow-md transition-all ${
                selectedAvailable.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              tooltip="Ajouter les pièces sélectionnées"
              tooltipOptions={{ position: "top" }}
            />
            <Button
              icon={<ArrowLeft size={20} />}
              onClick={moveLeft}
              disabled={selectedAssigned.length === 0}
              className={`p-3 rounded-full shadow-md transition-all ${
                selectedAssigned.length > 0
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              tooltip="Retirer les pièces sélectionnées"
              tooltipOptions={{ position: "top" }}
            />
          </div>

          {/* Liste des pièces affectées (droite) */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare size={16} className="text-dgcc6" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Pièces affectées ({assignedPieces.length})
              </span>
            </div>
            <div className="flex-1 border-2 border-dgcc12 rounded-2xl overflow-y-auto bg-dgcc13/30 shadow-inner">
              {assignedPieces.length > 0 ? (
                assignedPieces.map((p) =>
                  renderPieceItem(p, selectedAssigned, setSelectedAssigned),
                )
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  Aucune pièce affectée
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-slate-400 hover:text-slate-600 font-medium"
          />
          <Button
            label={loading ? "Enregistrement..." : "Confirmer"}
            onClick={handleSubmit}
            className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-3 rounded-xl border-none shadow-lg transition-all"
            disabled={loading}
          />
        </div>
      </div>
    </Dialog>
  );
}
