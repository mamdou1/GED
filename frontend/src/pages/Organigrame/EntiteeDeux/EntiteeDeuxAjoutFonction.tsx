import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Save, PlusCircle, BookmarkPlus } from "lucide-react";
import { createFonction, updateFonctionById } from "../../../api/fonction";
import { Toast } from "primereact/toast";

export default function EntiteeDeuxAjoutFonction({
  visible,
  onHide,
  entiteeDeux,
  refresh,
  onSuccess,
  editing,
}: any) {
  const [libelle, setLibelle] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (editing) {
      setLibelle(editing.libelle);
    } else {
      setLibelle("");
    }
  }, [editing, visible]);

  const handleSubmit = async () => {
    // 1. Vérification de sécurité
    if (!libelle || !entiteeDeux?.id) {
      toast.current?.show({
        severity: "warn",
        summary: "Attention",
        detail: "Le libellé est requis",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      if (editing?.id) {
        // --- MODE EDITION ---
        await updateFonctionById(editing.id, { libelle });
        toast.current?.show({
          severity: "success",
          summary: "Mise à jour réussie",
          detail: `La fonction a été modifiée avec succès`,
          life: 3000,
        });
      } else {
        // --- MODE CREATION ---
        await createFonction({
          libelle,
          entitee_deux_id: entiteeDeux.id,
        });
        toast.current?.show({
          severity: "success",
          summary: "Création réussie",
          detail: "La nouvelle fonction a été ajoutée",
          life: 3000,
        });
      }

      setLibelle("");

      // On laisse un petit délai pour que l'utilisateur voit le toast avant la fermeture
      setTimeout(() => {
        onSuccess();
      }, 500);
      //refresh();
    } catch (error) {
      console.error("Erreur lors de l'opération", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Une erreur est survenue lors de l'enregistrement",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <PlusCircle size={20} className="text-indigo-500" />
            {/* Utilisation de ?.titre pour éviter le crash si entiteeUn est null */}
            <span>
              {editing ? "Modifier" : "Ajouter"} une fonction au{" "}
              {entiteeDeux?.titre || "..."}
            </span>
          </div>
        }
        visible={visible}
        style={{ width: "450px" }}
        onHide={() => {
          setLibelle("");
          onHide();
        }}
        draggable={false}
      >
        <div className="pt-4 space-y-5">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
              cible
              {entiteeDeux?.titre}
            </p>
            <p className="text-emerald-900 font-bold">{entiteeDeux?.libelle}</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <BookmarkPlus size={16} className="text-purple-500" /> Nom de la
              fonction
            </label>
            <InputText
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              label="Annuler"
              onClick={onHide}
              className="p-button-text text-slate-500 font-semibold"
            />
            <Button
              label={loading ? "Ajout..." : "Ajouter la fonction"}
              icon={!loading && <Save size={18} className="mr-2" />}
              onClick={handleSubmit}
              disabled={!libelle || loading}
              className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-emerald-700 transition-all"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
