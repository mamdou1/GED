import React, { useEffect, useState } from "react";
import { getTraveByRayon } from "../../api/rayon";
import { Rayon, Trave } from "../../interfaces";
import {
  MapPin,
  Hash,
  Info,
  Archive,
  AlertCircle,
  Grid3X3,
} from "lucide-react";
import { Dialog } from "primereact/dialog";

interface RayonDetailsProps {
  visible: boolean;
  onHide: () => void;
  rayon: Rayon | null;
}

const RayonDetails = ({ visible, onHide, rayon }: RayonDetailsProps) => {
  const [travees, setTravees] = useState<Trave[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && rayon?.id) {
      setLoading(true);

      getTraveByRayon(rayon.id)
        .then((data) => {
          setTravees(Array.isArray(data) ? data : []);
        })
        .finally(() => setLoading(false));
    }
  }, [visible, rayon]);

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3 text-slate-800">
          <Info className="text-blue-500" size={24} />
          <span className="font-bold">Détails du rayon</span>
        </div>
      }
      visible={visible}
      onHide={onHide}
      className="w-full max-w-2xl"
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      modal
    >
      {rayon ? (
        <div className="space-y-6 pt-2">
          {/* HEADER */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-black mb-2">{rayon.code}</h1>

            <div className="flex flex-wrap gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <Hash size={16} />
                <span>Code: {rayon.code}</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>Salle: {rayon.salle?.libelle || "Non définie"}</span>
              </div>
            </div>
          </div>

          {/* TRAVEES */}
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Grid3X3 size={18} className="text-green-600" />
              Travées du rayon ({travees.length})
            </h2>

            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : travees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {travees.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-700 group-hover:text-green-600 transition-colors">
                        {t.code || `Travée ${t.id}`}
                      </span>

                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm" />
                    </div>

                    <p className="text-xs text-slate-500">Code : {t.code}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <Archive size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400">Aucune travée dans ce rayon</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 text-slate-400">
          <AlertCircle size={48} className="mb-2" />
          <p>Aucune donnée sélectionnée</p>
        </div>
      )}
    </Dialog>
  );
};

export default RayonDetails;
