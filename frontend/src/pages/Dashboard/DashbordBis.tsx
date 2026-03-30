import React from "react";
import Layout from "../../components/layout/Layoutt";
import {
  CircleDollarSign,
  Plus,
  ArrowRight,
  FileText,
  CheckCircle2,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom"; // Ou votre système de navigation

export default function WelcomeLandingPage() {
  // Stats fictives basées sur votre logique métier
  const stats = [
    {
      label: "Organisation",
      value: "128",
      icon: <FileText size={20} />,
      color: "bg-blue-500",
    },
    {
      label: "Fiabilité",
      value: "14",
      icon: <Clock size={20} />,
      color: "bg-amber-500",
    },
    {
      label: "Performance",
      value: "114",
      icon: <CheckCircle2 size={20} />,
      color: "bg-emerald-500",
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* --- HERO SECTION --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                Système de Gestion Budgétaire
              </span>
            </div>

            <h1 className="text-5xl font-extrabold text-slate-800 leading-tight">
              Bienvenue sur l'espace de gestion électronique des archives
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Gérez, suivez et traitez vos dossiers de dépense en toute
              simplicité. Centralisez vos pièces justificatives et optimisez vos
              processus de validation.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 font-bold transition-all transform hover:-translate-y-1">
                Accéder aux dossiers
                <ArrowRight size={20} />
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all">
                <Plus size={20} className="text-blue-600" />
                Nouveau dossier
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            {/* Illustration ou décoratif style dashboard */}
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 w-full aspect-square rounded-[3rem] shadow-2xl rotate-3 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <CircleDollarSign
                size={160}
                className="text-white opacity-20 absolute -bottom-10 -right-10"
              />
              <LayoutDashboard size={120} className="text-white" />
            </div>
          </div>
        </div>

        {/* --- STATS QUICK VIEW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${stat.color} p-3 rounded-2xl text-white shadow-inner`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  {/* <p className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p> */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- RACCOURCIS / ACTIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group bg-slate-800 p-8 rounded-[2.5rem] text-white overflow-hidden relative transition-all hover:bg-slate-900">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Suivi en temps réel</h3>
              <p className="text-slate-400 mb-6 max-w-xs">
                Consultez l'état d'avancement de vos dossiers
              </p>
              {/* <button className="text-blue-400 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                Voir la liste complète <ArrowRight size={18} />
              </button> */}
            </div>
            <FileText
              size={150}
              className="absolute -right-10 -bottom-10 text-white/5 group-hover:rotate-12 transition-transform"
            />
          </div>

          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex flex-col justify-center">
            <div className="flex items-start gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <Plus className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Besoin de changer votre nom d'utilisateur ou mot de passe ?
                </h3>
                <p className="text-slate-600 mb-4">
                  Cliqué sur le bouton à gauche du bouton déconnexion en haut à
                  gauche.
                </p>
                {/* <a
                  href="#"
                  className="text-blue-600 font-bold underline underline-offset-4"
                >
                  Consulter le manuel d'utilisation
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
