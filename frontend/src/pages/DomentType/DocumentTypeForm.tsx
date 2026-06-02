import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { FileText, Save, Hash, Info, X, Users } from "lucide-react";

// ✅ Options pour le dropdown conserne
const CONSERNE_OPTIONS = [
  { label: "Personne physique", value: "Personne physique" },
  { label: "Personne morale", value: "Personne morale" },
];

export default function DocumentTypeForm({
  onHide,
  onSubmit,
  refresh,
  initial = {},
  currentStructureLabel = "",
  isFiltered = false,
}: any) {
  const [nom, setNom] = useState("");
  const [cote, setCote] = useState("");
  const [conserne, setConserne] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialisation des champs
  useEffect(() => {
    setNom(initial?.nom || "");
    setCote(initial?.cote || "");
    setConserne(initial?.conserne || null);
  }, [initial]);

  const handleSubmit = async () => {
    if (!nom) return;
    setLoading(true);
    try {
      const payload: any = { nom };

      // ✅ Ajout du champ conserne (peut être null)
      if (conserne) {
        payload.conserne = conserne;
      }

      // ✅ Ajout du champ cote si présent
      // if (cote) {
      //   payload.cote = cote;
      // }

      await onSubmit(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Alerte Affectation Automatique */}
      {!initial?.id && isFiltered && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl transition-all animate-in fade-in slide-in-from-top-2">
          <Info size={18} className="text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold block uppercase mb-1">
              Affectation automatique
            </span>
            Ce type de document sera automatiquement lié à : <br />
            <span className="font-black underline italic">
              {currentStructureLabel}
            </span>
          </div>
        </div>
      )}

      {/* 2. Champs de saisie */}
      <div className="space-y-5">
        {/* Champ Cote (optionnel) */}
        {/* <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Hash size={14} className="text-emerald-500" /> Cote Référence
            <span className="text-[9px] font-normal text-slate-300 ml-1">
              (optionnel)
            </span>
          </label>
          <InputText
            value={cote}
            onChange={(e) => setCote(e.target.value.toUpperCase())}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
            placeholder="ex: 2-SD, 2-SRS, ADMIN-001..."
            autoFocus
          />
        </div> */}

        {/* Champ Libellé */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} className="text-emerald-500" /> Libellé du
            document
            <span className="text-red-500 text-xs">*</span>
          </label>
          <InputText
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all"
            placeholder="ex: Facture de service, Contrat de travail..."
          />
        </div>

        {/* ✅ Nouveau champ Conserne (dropdown) */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-emerald-500" /> Concerne
            <span className="text-[9px] font-normal text-slate-300 ml-1">
              (optionnel)
            </span>
          </label>
          <Dropdown
            value={conserne}
            options={CONSERNE_OPTIONS}
            onChange={(e) => setConserne(e.value)}
            placeholder="Sélectionner un type de destinataire"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl"
            panelClassName="rounded-xl"
            showClear
          />
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <Info size={18} className="text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              Indique si ce type de document concerne une personne physique ou
              une personne morale.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer intégré (Boutons d'action) */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
        <Button
          label="Annuler"
          icon={<X size={16} className="mr-2" />}
          onClick={onHide}
          className="p-button-text text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-all"
          disabled={loading}
        />
        <Button
          label={loading ? "Enregistrement..." : "Enregistrer le type"}
          icon={!loading && <Save size={18} className="mr-2" />}
          onClick={handleSubmit}
          loading={loading}
          disabled={!nom}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
        />
      </div>
    </div>
  );
}
