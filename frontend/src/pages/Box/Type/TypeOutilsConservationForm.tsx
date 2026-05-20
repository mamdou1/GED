import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { TypeOutilsConservation } from "../../../interfaces";
import { useCreateTypeOutilsConservation } from "../../../hooks/useTypeOutilsConservation";
import { Type } from "lucide-react";

interface Props {
  visible: boolean;
  onHide: () => void;
  onSubmit: (
    data: Partial<TypeOutilsConservation>,
    photoFile?: File,
  ) => Promise<void>;
  refresh: () => void;
  initial?: Partial<TypeOutilsConservation>;
}

const TypeOutilsConservationForm: React.FC<Props> = ({
  visible,
  onHide,
  onSubmit,
  refresh,
  initial,
}) => {
  const [formData, setFormData] = useState<Partial<TypeOutilsConservation>>({
    nom: initial?.nom || "",
  });
  const toast = useRef<Toast>(null);
  const createTypeMutation = useCreateTypeOutilsConservation();

  useEffect(() => {
    if (formData.nom) {
      setFormData((prev) => ({ ...prev, nom: formData.nom }));
    }
  }, [formData.nom]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTypeMutation.mutateAsync(formData);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Type d'outil de conservation créé avec succès",
      });
      setTimeout(() => {
        onHide();
        refresh?.();
      }, 1500);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de la création du type d'outil de conservation",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Créer un type d'outil de conservation"
        className="rounded-3xl"
        style={{ width: "500px" }}
        modal
      >
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label
              htmlFor="nom"
              className=" text-sm text-bold font-semibold text-emerald-600 mb-2 gap-2 flex items-center"
            >
              <Type size={14} /> Nom du type d'outils de conservation
            </label>
            <InputText
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 "
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              label="Annuler"
              onClick={onHide}
              className="p-button-text"
            />
            <Button
              type="submit"
              label={createTypeMutation.isPending ? "Création..." : "Créer"}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
              disabled={createTypeMutation.isPending}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default TypeOutilsConservationForm;
