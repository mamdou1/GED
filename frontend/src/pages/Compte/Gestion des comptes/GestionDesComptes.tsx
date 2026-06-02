// src/pages/Compte/ComptePage.tsx
import React, { useState } from "react";
import Layout from "../../../components/layout/Layoutt";
import { Building2, CreditCard, Users } from "lucide-react";
import ListeTypeCompte from "../Liste/ListeTypeCompte";
import ListeCompteAvecDeuxOnglets from "./ListeCompteAvecDeuxOnglets";
type CompteTab = "types" | "comptes";

export default function ComptePage() {
  const [activeTab, setActiveTab] = useState<CompteTab>("types");

  const tabs = [
    {
      key: "types" as const,
      label: "Types de compte",
      icon: <Building2 size={18} />,
    },
    {
      key: "comptes" as const,
      label: "Comptes",
      icon: <CreditCard size={18} />,
    },
  ];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <CreditCard size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Gestion des <span className="text-emerald-600">Comptes</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Comptes clients, types, métadonnées associées et gestion des
              clients
            </p>
          </div>
        </div>
      </div>
      {/* ✅ Onglets avec le nouveau "Clients" */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 mb-6 inline-flex gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                active
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
      {/* ✅ Contenu selon l'onglet actif */}
      {activeTab === "types" && <ListeTypeCompte />}
      {activeTab === "comptes" && <ListeCompteAvecDeuxOnglets />}
      {/* ✅ Afficher ClientListe */}
    </Layout>
  );
}
