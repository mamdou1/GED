import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import {
  BoxIcon,
  Hash,
  Type,
  BarChart3,
  MapPin,
  Save,
  Building2,
  Layers,
  GitMerge,
  Briefcase,
} from "lucide-react";
import { getTraves } from "../../api/trave";
import {
  EntiteeDeux,
  EntiteeTrois,
  EntiteeUn,
  Trave,
  TypeDocument,
} from "../../interfaces";
import { Dropdown } from "primereact/dropdown";
import { getAllEntiteeUn } from "../../api/entiteeUn";
import {
  getAllEntiteeDeux,
  getEntiteeDeuxByEntiteeUn,
} from "../../api/entiteeDeux";
import {
  getAllEntiteeTrois,
  getEntiteeTroisByEntiteeDeux,
} from "../../api/entiteeTrois";
import { getTypeDocuments } from "../../api/typeDocument";

export default function BoxForm({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial,
}: any) {
  const [formData, setFormData] = useState({
    code_box: "",
    libelle: "",
    capacite_max: 10,
    trave_id: null,
    type_document_id: "",
    entitee_un_id: "",
    entitee_deux_id: "",
    entitee_trois_id: "",
  });

  // États séparés pour les dropdowns (pour la cascade)
  const [entitee_un_id, setEntitee_un_id] = useState<number | undefined>();
  const [entitee_deux_id, setEntitee_deux_id] = useState<number | undefined>();
  const [entitee_trois_id, setEntitee_trois_id] = useState<
    number | undefined
  >();
  const [type_document_id, setType_document_id] = useState<
    number | undefined
  >();

  const [allEntiteeUn, setAllEntiteeUn] = useState<EntiteeUn[]>([]);
  const [allEntiteeDeux, setAllEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [allEntiteeTrois, setAllEntiteeTrois] = useState<EntiteeTrois[]>([]);
  const [allTypeDocuments, setAllTypeDocuments] = useState<TypeDocument[]>([]);
  const [filteredTypeDocuments, setFilteredTypeDocuments] = useState<
    TypeDocument[]
  >([]);
  const [trave, setTrave] = useState<Trave[]>([]);
  const [loadingTrave, setLoadingTrave] = useState(false);

  const [titreEntiteeDeux, setTitreEntiteeDeux] = useState<EntiteeDeux[]>([]);
  const [titreEntiteeTrois, setTitreEntiteeTrois] = useState<EntiteeTrois[]>(
    [],
  );

  // ✅ Vérifier si les titres existent
  const titreUnExiste = allEntiteeUn.length > 0 && allEntiteeUn[0]?.titre;
  const titreDeuxExiste =
    titreEntiteeDeux.length > 0 && titreEntiteeDeux[0]?.titre;
  const titreTroisExiste =
    titreEntiteeTrois.length > 0 && titreEntiteeTrois[0]?.titre;

  // console.log("titre 1: ", titreUnExiste);
  // console.log("titre 2: ", titreDeuxExiste);
  // console.log("titre 3: ", titreTroisExiste);

  // Chargement initial des données
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [entitees, types, ent2, ent3] = await Promise.all([
          getAllEntiteeUn(),
          getTypeDocuments(), // ✅ Correction : ajout des parenthèses
          getAllEntiteeDeux(),
          getAllEntiteeTrois(),
        ]);
        setAllEntiteeUn(Array.isArray(entitees) ? entitees : []);
        setAllTypeDocuments(
          Array.isArray(types?.typeDocument) ? types.typeDocument : [],
        );
        setTitreEntiteeDeux(Array.isArray(ent2) ? ent2 : []);
        setTitreEntiteeTrois(Array.isArray(ent3) ? ent3 : []);
      } catch (error) {
        console.error("❌ Erreur chargement données initiales:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Chargement de la liste des travées
  useEffect(() => {
    if (visible) {
      setLoadingTrave(true);
      getTraves()
        .then((data) => {
          // Adapter selon le format de votre API
          const traves = data.trave || data || [];
          setTrave(Array.isArray(traves) ? traves : []);
        })
        .catch((error) => console.error("❌ Erreur chargement travées:", error))
        .finally(() => setLoadingTrave(false));
    }
  }, [visible]);

  // Initialisation du formulaire (édition)
  useEffect(() => {
    if (initial?.id) {
      setFormData({
        code_box: initial.code_box || "",
        libelle: initial.libelle || "",
        capacite_max: initial.capacite_max || 10,
        trave_id: initial.trave_id || null,
        type_document_id: initial.type_document_id || "",
        entitee_un_id: initial.entitee_un_id || "",
        entitee_deux_id: initial.entitee_deux_id || "",
        entitee_trois_id: initial.entitee_trois_id || "",
      });

      // Synchroniser les états séparés
      setEntitee_un_id(initial.entitee_un_id);
      setEntitee_deux_id(initial.entitee_deux_id);
      setEntitee_trois_id(initial.entitee_trois_id);
      setType_document_id(initial.type_document_id);

      // Charger les sous-entités si nécessaire
      if (initial.entitee_un_id) {
        loadEntiteeDeux(initial.entitee_un_id);
      }
      if (initial.entitee_deux_id) {
        loadEntiteeTrois(initial.entitee_deux_id);
      }
    } else {
      // Mode création : réinitialiser
      setFormData({
        code_box: "",
        libelle: "",
        capacite_max: 10,
        trave_id: null,
        type_document_id: "",
        entitee_un_id: "",
        entitee_deux_id: "",
        entitee_trois_id: "",
      });
      setEntitee_un_id(undefined);
      setEntitee_deux_id(undefined);
      setEntitee_trois_id(undefined);
      setType_document_id(undefined);
      setAllEntiteeDeux([]);
      setAllEntiteeTrois([]);
    }
  }, [initial, visible]);

  // Filtrer les types de documents selon l'entité sélectionnée
  useEffect(() => {
    if (!entitee_un_id && !entitee_deux_id && !entitee_trois_id) {
      setFilteredTypeDocuments([]);
      return;
    }

    // Logique de filtrage : si une entité est sélectionnée, on filtre les types qui y sont rattachés
    const filtered = allTypeDocuments.filter((typeDoc) => {
      if (entitee_trois_id) {
        return typeDoc.entitee_trois_id === entitee_trois_id;
      }
      if (entitee_deux_id) {
        return typeDoc.entitee_deux_id === entitee_deux_id;
      }
      if (entitee_un_id) {
        return typeDoc.entitee_un_id === entitee_un_id;
      }
      return false;
    });

    setFilteredTypeDocuments(filtered);
  }, [entitee_un_id, entitee_deux_id, entitee_trois_id, allTypeDocuments]);

  // --- Handlers de changement (Logique de cascade) ---
  const loadEntiteeDeux = async (id: number) => {
    try {
      const divs = await getEntiteeDeuxByEntiteeUn(id);
      setAllEntiteeDeux(Array.isArray(divs) ? divs : []);
    } catch (error) {
      console.error("❌ Erreur chargement entiteeDeux:", error);
      setAllEntiteeDeux([]);
    }
  };

  const loadEntiteeTrois = async (id: number) => {
    try {
      const secs = await getEntiteeTroisByEntiteeDeux(id);
      setAllEntiteeTrois(Array.isArray(secs) ? secs : []);
    } catch (error) {
      console.error("❌ Erreur chargement entiteeTrois:", error);
      setAllEntiteeTrois([]);
    }
  };

  const handleEntiteeUnChange = async (id: number) => {
    setEntitee_un_id(id);
    setEntitee_deux_id(undefined);
    setEntitee_trois_id(undefined);
    setType_document_id(undefined);

    // Mettre à jour formData
    setFormData((prev) => ({
      ...prev,
      entitee_un_id: String(id),
      entitee_deux_id: "",
      entitee_trois_id: "",
      type_document_id: "",
    }));

    await loadEntiteeDeux(id);
    setAllEntiteeTrois([]);
  };

  const handleEntiteeDeuxChange = async (id: number) => {
    setEntitee_deux_id(id);
    setEntitee_trois_id(undefined);
    setType_document_id(undefined);

    // Mettre à jour formData
    setFormData((prev) => ({
      ...prev,
      entitee_deux_id: String(id),
      entitee_trois_id: "",
      type_document_id: "",
    }));

    await loadEntiteeTrois(id);
  };

  const handleEntiteeTroisChange = (id: number) => {
    setEntitee_trois_id(id);

    // Mettre à jour formData
    setFormData((prev) => ({
      ...prev,
      entitee_trois_id: String(id),
    }));
  };

  const handleTypeDocumentChange = (id: number) => {
    setType_document_id(id);
    setFormData((prev) => ({
      ...prev,
      type_document_id: String(id),
    }));
  };

  const titreUn = allEntiteeUn[0]?.titre || "Entité 1";
  const titreDeux = titreEntiteeDeux[0]?.titre || "Entité 2";
  const titreTrois = titreEntiteeTrois[0]?.titre || "Entité 3";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier que les champs requis sont remplis
    if (!formData.code_box || !formData.libelle) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Créer le payload final
    const payload = {
      ...formData,
      capacite_max: Number(formData.capacite_max),

      trave_id: formData.trave_id ? Number(formData.trave_id) : null, // ✅ IMPORTANT

      entitee_un_id: formData.entitee_un_id
        ? Number(formData.entitee_un_id)
        : null,
      entitee_deux_id: formData.entitee_deux_id
        ? Number(formData.entitee_deux_id)
        : null,
      entitee_trois_id: formData.entitee_trois_id
        ? Number(formData.entitee_trois_id)
        : null,
      type_document_id: formData.type_document_id
        ? Number(formData.type_document_id)
        : null,
    };
    onSubmit(payload);
  };

  const labelClass =
    "flex items-center gap-2 text-sm font-bold text-slate-700 mb-2";
  const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-emerald-900 font-medium";

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <BoxIcon className="text-emerald-600" size={20} />
          <span>{initial?.id ? "Modifier le Box" : "Nouveau Box"}</span>
        </div>
      }
      style={{ width: "900px" }}
      className="rounded-3xl"
      modal
    >
      <form onSubmit={handleSubmit} className="pt-4 grid grid-cols-2 gap-6">
        {/* Colonne Gauche: Identité */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-2">
            Identité
          </h3>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
              <Hash size={14} /> Code Identifiant
            </label>
            <InputText
              className={inputClass}
              placeholder="Ex: BX-2024-001"
              value={formData.code_box}
              onChange={(e) =>
                setFormData({ ...formData, code_box: e.target.value })
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
              <Type size={14} /> Libellé / Nom
            </label>
            <InputText
              className={inputClass}
              placeholder="Ex: Archives RH"
              value={formData.libelle}
              onChange={(e) =>
                setFormData({ ...formData, libelle: e.target.value })
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
              <BarChart3 size={14} /> Capacité maximale (Documents)
            </label>
            <InputNumber
              className="w-full"
              inputClassName="p-3 bg-slate-50 border border-slate-200 rounded-xl w-full"
              value={formData.capacite_max}
              onValueChange={(e) =>
                setFormData({ ...formData, capacite_max: e.value || 10 })
              }
              min={1}
              showButtons
            />
          </div>

          {/* Sélection de la Travée */}
          {/* <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
              <MapPin size={14} /> Travée de destination
            </label>
            <Dropdown
              value={formData.trave_id}
              options={trave}
              optionLabel="code" // ✅ Utiliser libelle au lieu de code
              optionValue="id"
              placeholder={
                loadingTrave ? "Chargement..." : "Choisir une travée"
              }
              className="w-full bg-emerald-50 border-emerald-200 rounded-xl text-left"
              onChange={(e) => setFormData({ ...formData, trave_id: e.value })}
              filter
              required
            />
          </div> */}
        </div>

        {/* Colonne Droite: Affectation */}
        <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-black uppercase text-emerald-500 tracking-widest border-b border-emerald-100 pb-2">
            Affectation Structurelle
          </h3>

          {/* Niveau 1 */}
          {titreUnExiste && (
            <div>
              <label className={labelClass}>
                <Building2 size={14} className="text-emerald-500" /> {titreUn}
              </label>
              <Dropdown
                value={entitee_un_id}
                options={allEntiteeUn}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteeUnChange(Number(e.value))}
                placeholder={`Sélectionner ${titreUn}`}
                className="w-full rounded-xl"
                filter
              />
            </div>
          )}

          {/* Niveau 2 */}
          {titreDeuxExiste && (
            <div>
              <label className={labelClass}>
                <Layers size={14} className="text-emerald-500" /> {titreDeux}
              </label>
              <Dropdown
                value={entitee_deux_id}
                options={allEntiteeDeux}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteeDeuxChange(Number(e.value))}
                placeholder={`Sélectionner ${titreDeux}`}
                className="w-full rounded-xl"
                disabled={!entitee_un_id}
                filter
              />
            </div>
          )}

          {/* Niveau 3 */}
          {titreTroisExiste && (
            <div>
              <label className={labelClass}>
                <GitMerge size={14} className="text-orange-500" /> {titreTrois}
              </label>
              <Dropdown
                value={entitee_trois_id}
                options={allEntiteeTrois}
                optionLabel="libelle"
                optionValue="id"
                onChange={(e) => handleEntiteeTroisChange(Number(e.value))}
                placeholder={`Sélectionner ${titreTrois}`}
                className="w-full rounded-xl"
                disabled={!entitee_deux_id}
                filter
              />
            </div>
          )}

          {/* Type de document */}
          <div>
            <label className={labelClass}>
              <Briefcase size={14} className="text-purple-500" /> Type de
              document
            </label>
            <Dropdown
              value={type_document_id}
              options={filteredTypeDocuments}
              optionLabel="nom"
              optionValue="id"
              onChange={(e) => handleTypeDocumentChange(Number(e.value))}
              placeholder={
                !entitee_un_id
                  ? "Sélectionnez d'abord une structure"
                  : filteredTypeDocuments.length === 0
                    ? "Aucun type disponible pour cette structure"
                    : "Attribuer un type de document"
              }
              className="w-full rounded-xl"
              disabled={!entitee_un_id || filteredTypeDocuments.length === 0}
              filter
            />
          </div>
        </div>

        {/* Footer */}
        <div className="col-span-2 flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
          <Button
            type="button"
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-emerald-400"
          />
          <Button
            type="submit"
            icon={<Save size={18} className="mr-2" />}
            label="Enregistrer"
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
          />
        </div>
      </form>
    </Dialog>
  );
}
