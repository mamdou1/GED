import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import {
  BoxIcon,
  Building2,
  Layers,
  GitMerge,
  Briefcase,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getAllEntiteeUn } from "../../api/entiteeUn";
import { getEntiteeDeuxByEntiteeUn } from "../../api/entiteeDeux";
import { getEntiteeTroisByEntiteeDeux } from "../../api/entiteeTrois";
import { getTypeDocuments } from "../../api/typeDocument";
import {
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  TypeDocument,
  Box,
} from "../../interfaces";

interface BoxAffectationFormProps {
  visible: boolean;
  onHide: () => void;
  box: Box | null;
  onSubmit: (payload: any) => void;
}

export default function BoxAffectationForm({
  visible,
  onHide,
  box,
  onSubmit,
}: BoxAffectationFormProps) {
  // États pour les entités
  const [entiteeUnId, setEntiteeUnId] = useState<number | null>(null);
  const [entiteeDeuxId, setEntiteeDeuxId] = useState<number | null>(null);
  const [entiteeTroisId, setEntiteeTroisId] = useState<number | null>(null);
  const [typeDocumentId, setTypeDocumentId] = useState<number | null>(null);

  // Données chargées
  const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);
  const [allEntiteeDeux, setAllEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [allEntiteeTrois, setAllEntiteeTrois] = useState<EntiteeTrois[]>([]);
  const [allTypeDocuments, setAllTypeDocuments] = useState<TypeDocument[]>([]);
  const [filteredTypeDocuments, setFilteredTypeDocuments] = useState<
    TypeDocument[]
  >([]);

  const [loadingEntiteUn, setLoadingEntiteUn] = useState(false);
  const [loadingEntiteDeux, setLoadingEntiteDeux] = useState(false);
  const [loadingEntiteTrois, setLoadingEntiteTrois] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [titreEntiteeDeux, setTitreEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [titreEntiteeTrois, setTitreEntiteeTrois] = useState<EntiteeTrois[]>(
    [],
  );

  // =============================================
  // CHARGEMENT INITIAL
  // =============================================
  useEffect(() => {
    if (visible) {
      loadEntiteUn();
      loadTypeDocuments();
    }
  }, [visible]);

  // =============================================
  // INITIALISATION EN MODE ÉDITION
  // =============================================
  useEffect(() => {
    if (box && visible) {
      setEntiteeUnId(box.entitee_un_id || null);
      setEntiteeDeuxId(box.entitee_deux_id || null);
      setEntiteeTroisId(box.entitee_trois_id || null);
      setTypeDocumentId(box.type_document_id || null);

      // Charger les cascades
      if (box.entitee_un_id) {
        loadEntiteDeux(box.entitee_un_id);
      }
      if (box.entitee_deux_id) {
        loadEntiteTrois(box.entitee_deux_id);
      }
    } else if (visible) {
      // Mode création
      setEntiteeUnId(null);
      setEntiteeDeuxId(null);
      setEntiteeTroisId(null);
      setTypeDocumentId(null);
      setAllEntiteeDeux([]);
      setAllEntiteeTrois([]);
    }
  }, [box, visible]);

  // =============================================
  // FILTRAGE DES TYPES DE DOCUMENTS
  // =============================================
  useEffect(() => {
    if (!entiteeUnId && !entiteeDeuxId && !entiteeTroisId) {
      setFilteredTypeDocuments([]);
      return;
    }

    const filtered = allTypeDocuments.filter((typeDoc) => {
      if (entiteeTroisId) {
        return typeDoc.entitee_trois_id === entiteeTroisId;
      }
      if (entiteeDeuxId) {
        return typeDoc.entitee_deux_id === entiteeDeuxId;
      }
      if (entiteeUnId) {
        return typeDoc.entitee_un_id === entiteeUnId;
      }
      return false;
    });

    setFilteredTypeDocuments(filtered);
  }, [entiteeUnId, entiteeDeuxId, entiteeTroisId, allTypeDocuments]);

  // =============================================
  // FONCTIONS DE CHARGEMENT
  // =============================================
  const loadEntiteUn = async () => {
    setLoadingEntiteUn(true);
    try {
      const data = await getAllEntiteeUn();
      setAllEntiteeUn(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Erreur chargement entités niveau 1:", err);
      setAllEntiteeUn([]);
    } finally {
      setLoadingEntiteUn(false);
    }
  };

  const loadEntiteDeux = async (entiteUnId: number) => {
    setLoadingEntiteDeux(true);
    try {
      const data = await getEntiteeDeuxByEntiteeUn(entiteUnId);
      setAllEntiteeDeux(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Erreur chargement entités niveau 2:", err);
      setAllEntiteeDeux([]);
    } finally {
      setLoadingEntiteDeux(false);
    }
  };

  const loadEntiteTrois = async (entiteDeuxId: number) => {
    setLoadingEntiteTrois(true);
    try {
      const data = await getEntiteeTroisByEntiteeDeux(entiteDeuxId);
      setAllEntiteeTrois(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Erreur chargement entités niveau 3:", err);
      setAllEntiteeTrois([]);
    } finally {
      setLoadingEntiteTrois(false);
    }
  };

  const loadTypeDocuments = async () => {
    setLoadingTypes(true);
    try {
      const data = await getTypeDocuments();
      setAllTypeDocuments(
        Array.isArray(data?.typeDocument) ? data.typeDocument : [],
      );
    } catch (err) {
      console.error("❌ Erreur chargement types de documents:", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  // =============================================
  // HANDLERS DE CHANGEMENT (CASCADE ENTITÉS)
  // =============================================
  const handleEntiteUnChange = (id: number | null) => {
    setEntiteeUnId(id);
    setEntiteeDeuxId(null);
    setEntiteeTroisId(null);
    setTypeDocumentId(null);
    setAllEntiteeDeux([]);
    setAllEntiteeTrois([]);

    if (id) {
      loadEntiteDeux(id);
    }
  };

  const handleEntiteDeuxChange = (id: number | null) => {
    setEntiteeDeuxId(id);
    setEntiteeTroisId(null);
    setTypeDocumentId(null);
    setAllEntiteeTrois([]);

    if (id) {
      loadEntiteTrois(id);
    }
  };

  const handleEntiteTroisChange = (id: number | null) => {
    setEntiteeTroisId(id);
    setTypeDocumentId(null);
  };

  // =============================================
  // SOUMISSION
  // =============================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      box_id: box?.id,
      entitee_un_id: entiteeUnId,
      entitee_deux_id: entiteeDeuxId,
      entitee_trois_id: entiteeTroisId,
      type_document_id: typeDocumentId,
    };

    onSubmit(payload);
  };

  // ✅ Vérifier si les titres existent
  const titreUnExiste = allEntiteeUn.length > 0 && allEntiteeUn[0]?.titre;
  const titreDeuxExiste =
    titreEntiteeDeux.length > 0 && titreEntiteeDeux[0]?.titre;
  const titreTroisExiste =
    titreEntiteeTrois.length > 0 && titreEntiteeTrois[0]?.titre;

  // =============================================
  // TITRES DYNAMIQUES
  // =============================================
  const titreNiveau1 = allEntiteeUn[0]?.titre || "Niveau 1";
  const titreNiveau2 = allEntiteeDeux[0]?.titre || "Niveau 2";
  const titreNiveau3 = allEntiteeTrois[0]?.titre || "Niveau 3";

  // =============================================
  // STYLES
  // =============================================
  const labelClass =
    "text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-1.5";
  const dropdownClass = "w-full rounded-xl";

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <BoxIcon className="text-amber-600" size={20} />
          </div>
          <div>
            <span className="text-lg font-bold">
              {box ? "Affectation du Box" : "Nouvelle Affectation"}
            </span>
            {box && (
              <p className="text-xs text-slate-500 font-normal">
                {box.libelle} ({box.code_box})
              </p>
            )}
          </div>
        </div>
      }
      style={{ width: "600px" }}
      className="rounded-3xl"
      modal
      closable={false}
    >
      <form onSubmit={handleSubmit} className="pt-4">
        {/* Info Box */}
        {box && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-slate-700">{box.libelle}</p>
              <p className="text-xs text-slate-500">
                Code: {box.code_box} • Capacité: {box.current_count || 0}/
                {box.capacite_max}
              </p>
            </div>
          </div>
        )}

        {/* Section Entités */}
        <div className="space-y-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-100">
          <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest mb-2 flex items-center gap-2">
            <Building2 size={14} />
            Rattachement Structurel
          </h3>

          {/* Niveau 1 */}
          {titreUnExiste && (
            <div>
              <label className={labelClass}>
                <Building2 size={14} className="text-blue-500" /> {titreNiveau1}
              </label>
              <Dropdown
                value={entiteeUnId}
                options={allEntiteeUn}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteUnChange(e.value)}
                placeholder={
                  loadingEntiteUn
                    ? "Chargement..."
                    : `Sélectionner ${titreNiveau1}`
                }
                className={dropdownClass}
                disabled={loadingEntiteUn}
                filter
                showClear
              />
            </div>
          )}

          {/* Niveau 2 */}
          {titreDeuxExiste && (
            <div>
              <label className={labelClass}>
                <Layers size={14} className="text-purple-500" /> {titreNiveau2}
              </label>
              <Dropdown
                value={entiteeDeuxId}
                options={allEntiteeDeux}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteDeuxChange(e.value)}
                placeholder={
                  !entiteeUnId
                    ? `Sélectionnez d'abord ${titreNiveau1}`
                    : loadingEntiteDeux
                      ? "Chargement..."
                      : `Sélectionner ${titreNiveau2}`
                }
                className={dropdownClass}
                disabled={!entiteeUnId || loadingEntiteDeux}
                filter
                showClear
              />
            </div>
          )}

          {/* Niveau 3 */}
          {titreTroisExiste && (
            <div>
              <label className={labelClass}>
                <GitMerge size={14} className="text-orange-500" />{" "}
                {titreNiveau3}
              </label>
              <Dropdown
                value={entiteeTroisId}
                options={allEntiteeTrois}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteTroisChange(e.value)}
                placeholder={
                  !entiteeDeuxId
                    ? `Sélectionnez d'abord ${titreNiveau2}`
                    : loadingEntiteTrois
                      ? "Chargement..."
                      : `Sélectionner ${titreNiveau3}`
                }
                className={dropdownClass}
                disabled={!entiteeDeuxId || loadingEntiteTrois}
                filter
                showClear
              />
            </div>
          )}

          {/* Type de document */}
          <div>
            <label className={labelClass}>
              <Briefcase size={14} className="text-emerald-500" /> Type de
              document
            </label>
            <Dropdown
              value={typeDocumentId}
              options={filteredTypeDocuments}
              optionLabel="nom"
              optionValue="id"
              onChange={(e) => setTypeDocumentId(e.value)}
              placeholder={
                !entiteeUnId && !entiteeDeuxId && !entiteeTroisId
                  ? "Sélectionnez d'abord une structure"
                  : filteredTypeDocuments.length === 0
                    ? "Aucun type disponible"
                    : "Attribuer un type de document"
              }
              className={dropdownClass}
              disabled={
                (!entiteeUnId && !entiteeDeuxId && !entiteeTroisId) ||
                filteredTypeDocuments.length === 0
              }
              filter
              showClear
            />
          </div>
        </div>

        {/* Aperçu du chemin */}
        {(entiteeUnId || entiteeDeuxId || entiteeTroisId) && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-700 mb-2">
              Structure sélectionnée :
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              {entiteeUnId && (
                <>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    {allEntiteeUn.find((e) => e.id === entiteeUnId)?.libelle ||
                      `${titreNiveau1} #${entiteeUnId}`}
                  </span>
                  {entiteeDeuxId && <span className="text-slate-300">→</span>}
                </>
              )}
              {entiteeDeuxId && (
                <>
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                    {allEntiteeDeux.find((e) => e.id === entiteeDeuxId)
                      ?.libelle || `${titreNiveau2} #${entiteeDeuxId}`}
                  </span>
                  {entiteeTroisId && <span className="text-slate-300">→</span>}
                </>
              )}
              {entiteeTroisId && (
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                  {allEntiteeTrois.find((e) => e.id === entiteeTroisId)
                    ?.libelle || `${titreNiveau3} #${entiteeTroisId}`}
                </span>
              )}
              {!entiteeUnId && !entiteeDeuxId && !entiteeTroisId && (
                <span className="text-slate-400 italic">
                  Aucune structure sélectionnée
                </span>
              )}
            </div>
            {typeDocumentId && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-slate-500">Type :</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  {filteredTypeDocuments.find((t) => t.id === typeDocumentId)
                    ?.nom || `Type #${typeDocumentId}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
          <Button
            type="button"
            label="Annuler"
            onClick={onHide}
            className="p-button-outlined p-button-secondary rounded-xl px-6"
          />
          <Button
            type="submit"
            icon={<Save size={18} className="mr-2" />}
            label={box ? "Valider l'affectation" : "Créer l'affectation"}
            className="bg-amber-500 hover:bg-amber-600 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-amber-200 transition-all font-bold"
            disabled={submitting}
            loading={submitting}
          />
        </div>
      </form>
    </Dialog>
  );
}
