import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import {
  Hash,
  Type,
  DoorOpen,
  Save,
  MapPin,
  Layers,
  Grid3X3,
} from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { Site } from "../../interfaces";
import { getSites } from "../../api/site";

export default function SalleForm({ visible, onHide, onSubmit, initial }: any) {
  const [formData, setFormData] = useState({
    code_salle: "",
    libelle: "",
    site_id: "",
    mb_rayons: 1,
    mb_trave_rayon: 1,
    mb_Box_trave: 1,
    mb_traves_par_rayon: 1,
    nb_box: 1, // Nouveau champ
    sigle_rayon: "R", // Nouveau champ
    sigle_trave: "T", // Nouveau champ
    sigle_box: "B", // Nouveau champ
  });

  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSite, setLoadingSite] = useState(false);

  useEffect(() => {
    if (initial?.id) {
      setFormData({
        code_salle: initial.code_salle,
        libelle: initial.libelle,
        site_id: initial.site_id || "",
        mb_rayons: 0,
        mb_traves_par_rayon: 0,
        nb_box: 0,
        mb_trave_rayon: 0,
        mb_Box_trave: 0,
        sigle_rayon: "",
        sigle_trave: "",
        sigle_box: "",
      });
    } else {
      setFormData({
        code_salle: "",
        libelle: "",
        site_id: "",
        mb_rayons: 1,
        mb_traves_par_rayon: 1,
        nb_box: 1,
        mb_trave_rayon: 1,
        mb_Box_trave: 1,
        sigle_rayon: "R",
        sigle_trave: "T",
        sigle_box: "B",
      });
    }
  }, [initial, visible]);

  useEffect(() => {
    if (visible) {
      setLoadingSite(true);
      getSites()
        .then((data) => {
          const fetchedSites = Array.isArray(data) ? data : data.sites || [];
          setSites(fetchedSites);
        })
        .catch((err) => console.error("Erreur chargement sites:", err))
        .finally(() => setLoadingSite(false));
    }
  }, [visible]);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <DoorOpen className="text-emerald-600" size={20} />
          <span>
            {initial?.id
              ? "Modifier la salle"
              : "Nouvelle salle avec génération"}
          </span>
        </div>
      }
      className="w-full max-w-2xl" // Élargi pour accueillir les sigles
      modal
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }}
        className="flex flex-col gap-4 pt-4"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Code Salle */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-emerald-700 flex items-center gap-2 uppercase tracking-wider">
              <Hash size={14} /> Code Salle
            </label>
            <InputText
              className="p-3 bg-emerald-50 border-emerald-200 rounded-xl"
              placeholder="Ex: SALLE-01"
              value={formData.code_salle}
              onChange={(e) =>
                setFormData({ ...formData, code_salle: e.target.value })
              }
              required
            />
          </div>

          {/* Site */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-emerald-700 flex items-center gap-2 uppercase tracking-wider">
              <MapPin size={14} /> Site
            </label>
            <Dropdown
              value={formData.site_id}
              options={sites}
              optionLabel="nom"
              optionValue="id"
              placeholder={loadingSite ? "Chargement..." : "Choisir un site"}
              className="w-full bg-emerald-50 border-emerald-200 rounded-xl text-left"
              onChange={(e) => setFormData({ ...formData, site_id: e.value })}
              filter
              required
            />
          </div>
        </div>

        {/* Libellé */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-emerald-700 flex items-center gap-2 uppercase tracking-wider">
            <Type size={14} /> Libellé
          </label>
          <InputText
            className="p-3 bg-emerald-50 border-emerald-200 rounded-xl"
            placeholder="Ex: Archives Nord - Rez de chaussée"
            value={formData.libelle}
            onChange={(e) =>
              setFormData({ ...formData, libelle: e.target.value })
            }
            required
          />
        </div>

        {!initial?.id && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-2">
              Paramètres de génération
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Rayons */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-400">
                <label className="text-[10px] font-black text-emerald-800 flex items-center gap-1 uppercase">
                  <Layers size={12} /> Rayons
                </label>
                <InputNumber
                  value={formData.mb_rayons}
                  onValueChange={(e) =>
                    setFormData({ ...formData, mb_rayons: e.value || 1 })
                  }
                  min={1}
                  className="w-full border"
                  inputClassName="p-2 w-full text-center font-bold"
                  showButtons
                />
                {/* <InputNumber
                  value={formData.mb_trave_rayon}
                  onValueChange={(e) =>
                    setFormData({ ...formData, mb_trave_rayon: e.value || 1 })
                  }
                  min={1}
                  className="w-full"
                  inputClassName="p-2 w-full text-center font-bold"
                  placeholder="nombre de travé par rayon"
                  showButtons
                /> */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Sigle
                  </span>
                  <InputText
                    value={formData.sigle_rayon}
                    onChange={(e) =>
                      setFormData({ ...formData, sigle_rayon: e.target.value })
                    }
                    className="p-2 text-xs text-center uppercase border"
                    placeholder="Ex: R"
                  />
                </div>
              </div>

              {/* Travées */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-400">
                <label className="text-[10px] font-black text-emerald-800 flex items-center gap-1 uppercase">
                  <Grid3X3 size={12} /> Travées / R
                </label>
                <InputNumber
                  value={formData.mb_traves_par_rayon}
                  onValueChange={(e) =>
                    setFormData({
                      ...formData,
                      mb_traves_par_rayon: e.value || 1,
                    })
                  }
                  min={1}
                  className="w-full border"
                  inputClassName="p-2 w-full text-center font-bold"
                  showButtons
                />
                <InputNumber
                  value={formData.mb_Box_trave}
                  onValueChange={(e) =>
                    setFormData({
                      ...formData,
                      mb_Box_trave: e.value || 1,
                    })
                  }
                  min={1}
                  className="w-full border"
                  inputClassName="p-2 w-full text-center font-bold"
                  placeholder="nombre de travé par rayon"
                  showButtons
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Sigle
                  </span>
                  <InputText
                    value={formData.sigle_trave}
                    onChange={(e) =>
                      setFormData({ ...formData, sigle_trave: e.target.value })
                    }
                    className="p-2 text-xs text-center uppercase border"
                    placeholder="Ex: T"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            label="Annuler"
            onClick={onHide}
            className="p-button-text text-emerald-600"
          />
          <Button
            type="submit"
            icon={<Save size={18} className="mr-2" />}
            label="Générer la structure"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all font-bold"
          />
        </div>
      </form>
    </Dialog>
  );
}
