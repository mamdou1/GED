import { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import {
  BoxIcon,
  Hash,
  Type,
  BarChart3,
  MapPin,
  Save,
  Building2,
  Loader2,
} from "lucide-react";
import { Site, Salle, Rayon, Trave } from "../../interfaces";
// ✅ Importer les hooks TanStack Query
import {
  useSites,
  useSalles,
  useRayons,
  useTraves,
} from "../../hooks/useArchivageQueries";

export default function BoxForm({ visible, onHide, onSubmit, initial }: any) {
  // =============================================
  // ÉTATS DU FORMULAIRE
  // =============================================
  const [formData, setFormData] = useState({
    code_box: "",
    libelle: "",
    capacite_max: 10,
    site_id: null as number | null,
    salle_id: null as number | null,
    rayon_id: null as number | null,
    trave_id: null as number | null,
  });

  // =============================================
  // HOOKS TANSTACK QUERY POUR LES DONNÉES EN CASCADE
  // =============================================
  const { data: sites = [], isLoading: loadingSites } = useSites();

  const { data: salles = [], isLoading: loadingSalles } = useSalles(
    formData.site_id || 0,
  ); // ✅ Passer site_id en paramètre

  const { data: rayons = [], isLoading: loadingRayons } = useRayons(
    formData.salle_id || 0,
  ); // ✅ Passer salle_id en paramètre

  const { data: traves = [], isLoading: loadingTraves } = useTraves(
    formData.rayon_id || 0,
  ); // ✅ Passer rayon_id en paramètre

  // =============================================
  // INITIALISATION EN MODE ÉDITION
  // =============================================
  useEffect(() => {
    if (initial?.id && visible) {
      setFormData({
        code_box: initial.code_box || "",
        libelle: initial.libelle || "",
        capacite_max: initial.capacite_max || 10,
        site_id: initial.site_id || null,
        salle_id: initial.salle_id || null,
        rayon_id: initial.rayon_id || null,
        trave_id: initial.trave_id || null,
      });
    } else if (visible) {
      // Mode création : réinitialiser
      setFormData({
        code_box: "",
        libelle: "",
        capacite_max: 10,
        site_id: null,
        salle_id: null,
        rayon_id: null,
        trave_id: null,
      });
    }
  }, [initial, visible]);

  // =============================================
  // HANDLERS DE CHANGEMENT (CASCADE)
  // =============================================
  const handleSiteChange = (siteId: number | null) => {
    setFormData((prev) => ({
      ...prev,
      site_id: siteId,
      salle_id: null, // ✅ Réinitialiser les niveaux inférieurs
      rayon_id: null,
      trave_id: null,
    }));
  };

  const handleSalleChange = (salleId: number | null) => {
    setFormData((prev) => ({
      ...prev,
      salle_id: salleId,
      rayon_id: null, // ✅ Réinitialiser les niveaux inférieurs
      trave_id: null,
    }));
  };

  const handleRayonChange = (rayonId: number | null) => {
    setFormData((prev) => ({
      ...prev,
      rayon_id: rayonId,
      trave_id: null, // ✅ Réinitialiser le niveau inférieur
    }));
  };

  const handleTraveChange = (traveId: number | null) => {
    setFormData((prev) => ({
      ...prev,
      trave_id: traveId,
    }));
  };

  // =============================================
  // SOUMISSION
  // =============================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code_box || !formData.libelle || !formData.trave_id) {
      alert("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    const payload = {
      ...formData,
      capacite_max: Number(formData.capacite_max),
    };

    onSubmit(payload);
  };

  // =============================================
  // FONCTIONS UTILITAIRES POUR L'AFFICHAGE
  // =============================================
  const getSiteLabel = (siteId: number | null): string => {
    if (!siteId) return "";
    const site = sites.find((s) => String(s.id) === String(siteId));
    return site?.nom || `Site #${siteId}`;
  };

  const getSalleLabel = (salleId: number | null): string => {
    if (!salleId) return "";
    const salle = salles.find((s) => String(s.id) === String(salleId));
    return salle?.libelle || `Salle #${salleId}`;
  };

  const getRayonLabel = (rayonId: number | null): string => {
    if (!rayonId) return "";
    const rayon = rayons.find((r) => String(r.id) === String(rayonId));
    return rayon?.code || `Rayon #${rayonId}`;
  };

  const getTraveLabel = (traveId: number | null): string => {
    if (!traveId) return "";
    const trave = traves.find((t) => String(t.id) === String(traveId));
    return trave?.code || `Travée #${traveId}`;
  };

  // =============================================
  // STYLES
  // =============================================
  const labelClass =
    "text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-1.5";
  const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-emerald-900 font-medium";

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <BoxIcon className="text-emerald-600" size={20} />
          </div>
          <span className="text-lg font-bold">
            {initial?.id ? "Modifier le Box" : "Nouveau Box"}
          </span>
        </div>
      }
      style={{ width: "800px" }}
      className="rounded-3xl"
      modal
      closable={false}
    >
      <form onSubmit={handleSubmit} className="pt-4">
        {/* Section Identité */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className={labelClass}>
              <Hash size={14} /> Code *
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

          <div className="col-span-2">
            <label className={labelClass}>
              <Type size={14} /> Libellé *
            </label>
            <InputText
              className={inputClass}
              placeholder="Ex: Archives RH 2024"
              value={formData.libelle}
              onChange={(e) =>
                setFormData({ ...formData, libelle: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className={labelClass}>
            <BarChart3 size={14} /> Capacité maximale
          </label>
          <InputNumber
            className="w-full max-w-[200px]"
            inputClassName="p-3 bg-slate-50 border border-slate-200 rounded-xl w-full"
            value={formData.capacite_max}
            onValueChange={(e) =>
              setFormData({ ...formData, capacite_max: e.value || 10 })
            }
            min={1}
            max={9999}
            showButtons
          />
        </div>

        {/* Section Localisation (Filtres en cascade) */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
          <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest mb-4 flex items-center gap-2">
            <MapPin size={14} />
            Localisation (Site → Salle → Rayon → Travée)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* SITE */}
            <div>
              <label className={labelClass}>
                <Building2 size={14} className="text-blue-500" /> Site *
              </label>
              <div className="relative">
                <Dropdown
                  value={formData.site_id}
                  options={sites}
                  optionLabel="nom"
                  optionValue="id"
                  onChange={(e) => handleSiteChange(e.value ?? null)}
                  placeholder={
                    loadingSites ? "Chargement..." : "Sélectionner un site"
                  }
                  className="w-full rounded-xl"
                  disabled={loadingSites}
                  filter
                  showClear
                />
                {loadingSites && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <Loader2
                      size={16}
                      className="animate-spin text-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SALLE */}
            <div>
              <label className={labelClass}>
                <Building2 size={14} className="text-purple-500" /> Salle *
              </label>
              <div className="relative">
                <Dropdown
                  value={formData.salle_id}
                  options={salles}
                  optionLabel="libelle"
                  optionValue="id"
                  onChange={(e) => handleSalleChange(e.value ?? null)}
                  placeholder={
                    !formData.site_id
                      ? "Sélectionnez d'abord un site"
                      : loadingSalles
                        ? "Chargement..."
                        : salles.length === 0
                          ? "Aucune salle disponible"
                          : "Sélectionner une salle"
                  }
                  className="w-full rounded-xl"
                  disabled={!formData.site_id || loadingSalles}
                  filter
                  showClear
                />
                {loadingSalles && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <Loader2
                      size={16}
                      className="animate-spin text-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RAYON */}
            <div>
              <label className={labelClass}>
                <Building2 size={14} className="text-orange-500" /> Rayon *
              </label>
              <div className="relative">
                <Dropdown
                  value={formData.rayon_id}
                  options={rayons}
                  optionLabel="code"
                  optionValue="id"
                  onChange={(e) => handleRayonChange(e.value ?? null)}
                  placeholder={
                    !formData.salle_id
                      ? "Sélectionnez d'abord une salle"
                      : loadingRayons
                        ? "Chargement..."
                        : rayons.length === 0
                          ? "Aucun rayon disponible"
                          : "Sélectionner un rayon"
                  }
                  className="w-full rounded-xl"
                  disabled={!formData.salle_id || loadingRayons}
                  filter
                  showClear
                />
                {loadingRayons && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <Loader2
                      size={16}
                      className="animate-spin text-orange-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* TRAVÉE */}
            <div>
              <label className={labelClass}>
                <Building2 size={14} className="text-emerald-500" /> Travée *
              </label>
              <div className="relative">
                <Dropdown
                  value={formData.trave_id}
                  options={traves}
                  optionLabel="code"
                  optionValue="id"
                  onChange={(e) => handleTraveChange(e.value ?? null)}
                  placeholder={
                    !formData.rayon_id
                      ? "Sélectionnez d'abord un rayon"
                      : loadingTraves
                        ? "Chargement..."
                        : traves.length === 0
                          ? "Aucune travée disponible"
                          : "Sélectionner une travée"
                  }
                  className="w-full rounded-xl"
                  disabled={!formData.rayon_id || loadingTraves}
                  filter
                  showClear
                />
                {loadingTraves && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <Loader2
                      size={16}
                      className="animate-spin text-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chemin de fer visuel */}
          {formData.site_id && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-bold text-slate-700">Chemin :</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                {getSiteLabel(formData.site_id)}
              </span>

              {formData.salle_id && (
                <>
                  <span className="text-slate-300">→</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                    {getSalleLabel(formData.salle_id)}
                  </span>
                </>
              )}

              {formData.rayon_id && (
                <>
                  <span className="text-slate-300">→</span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                    {getRayonLabel(formData.rayon_id)}
                  </span>
                </>
              )}

              {formData.trave_id && (
                <>
                  <span className="text-slate-300">→</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {getTraveLabel(formData.trave_id)}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            label="Annuler"
            onClick={onHide}
            className="p-button-outlined p-button-secondary rounded-xl px-6"
          />
          <Button
            type="submit"
            icon={<Save size={18} className="mr-2" />}
            label={initial?.id ? "Mettre à jour" : "Créer le Box"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
          />
        </div>
      </form>
    </Dialog>
  );
}
