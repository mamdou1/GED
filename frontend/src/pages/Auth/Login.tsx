import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useAuth } from "../../context/AuthContext";
import { Toast } from "primereact/toast";
import {
  Lock,
  Phone,
  Eye,
  EyeOff,
  FileText,
  ArrowRight,
  Building2,
  Sparkles,
  Globe,
  CheckCircle2,
  Folders,
  FileStack,
  Layers,
  PersonStanding,
  UserRound,
  ListCheck,
  Blend,
} from "lucide-react";

export default function LoginPage() {
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();
  const toast = useRef<Toast>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await auth.login(telephone, password);
      toast.current?.show({
        severity: "success",
        summary: "Connexion réussie",
        detail: "Redirection en cours...",
        life: 2000,
      });
      setTimeout(() => nav("/"), 1500);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Échec de connexion",
        detail: "Identifiant ou mot de passe incorrect.",
        life: 4000,
      });
      console.log("Erreur :", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 font-sans relative overflow-hidden">
      <Toast ref={toast} position="top-center" />

      {/* Éléments décoratifs de fond - Palette emerald */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Container Principal avec effet de verre - AJOUTER flex ET h-[700px] */}
      <div className="relative w-full max-w-[1200px] h-[700px] flex bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden m-4 border border-white/20">
        {/* ===== Côté Gauche : Design Premium - Dégradé emerald ===== */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-950 p-12 flex-col justify-between relative overflow-hidden">
          {/* Effets de lumière */}
          <div className="absolute top-0 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-20 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl"></div>

          {/* Pattern de points */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>

          {/* Contenu gauche */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30 shadow-xl">
                <Folders className="text-white" size={36} />
              </div>
              <div>
                <span className="text-white font-black text-3xl tracking-tight">
                  DIGIDOC
                </span>{" "}
                <br />
                <span className="text-emerald-300  text-2xl text-italic">
                  MANAGER
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Sparkles size={12} className="text-emerald-300" />
                  <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                    Solution de digitalisation documentaire
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Bienvenue sur votre <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-400">
                  Espace de Gestion Electronique des Documents (GED)
                </span>
              </h2>

              <p className="text-emerald-100/90 text-md font-medium max-w-md leading-relaxed">
                Gérez vos documents, dossiers et archives en toute simplicité
                avec une sécurité maximale.
              </p>
            </div>

            {/* Liste des fonctionnalités avec icônes */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <FileStack size={18} className="text-emerald-300" />
                <span className="text-sm font-medium">
                  Gestion des types de documents
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Layers size={18} className="text-emerald-300" />
                <span className="text-sm font-medium">
                  Organisation par structures
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span className="text-sm font-medium">
                  Sécurité et traçabilité
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <ListCheck size={18} className="text-emerald-300" />
                <span className="text-sm font-medium">
                  Numérisation et intexation
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Blend size={18} className="text-emerald-300" />
                <span className="text-sm font-medium">
                  Interfaçage avec les applications métier
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <FileText size={18} className="text-emerald-300" />
                <span className="text-sm font-medium">
                  Archivage et recherche avancée
                </span>
              </div>
            </div>
          </div>

          {/* Footer gauche */}
          <div className="relative z-10 flex justify-between items-center mt-2">
            <p className="text-white/40 text-xs uppercase font-bold tracking-[0.2em]">
              © 2026 DIGIDOCManager Pro
            </p>
            <div className="flex gap-4">
              <Globe
                size={16}
                className="text-white/40 hover:text-white/60 cursor-pointer transition-colors"
              />
              <Building2
                size={16}
                className="text-white/40 hover:text-white/60 cursor-pointer transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ===== Côté Droite : Formulaire ===== */}
        <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
          {/* Header mobile (visible en dessous de md) */}
          <div className="md:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl mb-4">
              <Folders className="text-emerald-600" size={24} />
              <span className="font-black text-xl text-emerald-600">
                DOCMANAGER
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              Connexion
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Bienvenue ! Connectez-vous pour continuer
            </p>
          </div>

          {/* Header desktop (visible à partir de md) */}
          <div className="hidden md:block mb-20">
            <h3 className="text-3xl font-black text-slate-800 mb-3">
              Entrez vos identifiants
            </h3>
            <p className="text-slate-400 text-base">
              pour accéder à votre espace documentaire
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {/* Champ Téléphone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-600 rounded-full"></span>
                Login
              </label>
              <div className="relative group">
                <UserRound
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                  size={20}
                />
                <InputText
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex: mahmoud41"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all text-sm font-semibold placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 bg-emerald-700 rounded-full"></span>
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => nav("/send-code")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1"
                >
                  Mot de passe oublié ?
                  <ArrowRight size={12} />
                </button>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                  size={20}
                />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm font-semibold placeholder:text-slate-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Options supplémentaires */}
            {/* <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-500">
                  Se souvenir de moi
                </span>
              </label>
            </div> */}

            {/* Bouton de soumission - Style emerald */}
            <div className="pt-4">
              <Button
                label={isLoading ? "Connexion en cours..." : "Se connecter"}
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-200/50 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed text-base tracking-wide"
              />
            </div>
          </form>

          {/* Lien d'inscription */}
          {/* <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Vous n'avez pas de compte ?{" "}
              <button
                onClick={() => nav("/register")}
                className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors ml-1"
              >
                Créer un compte
              </button>
            </p>
          </div> */}

          {/* Séparateur social */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-wider">
                  Passez une excellente session
                </span>
              </div>
            </div>

            {/* <div className="mt-6 flex justify-center gap-4">
              <button className="p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-all border-2 border-slate-100 hover:border-emerald-200 group">
                <i className="pi pi-google text-emerald-600 text-xl group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-all border-2 border-slate-100 hover:border-emerald-200 group">
                <i className="pi pi-facebook text-emerald-700 text-xl group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-all border-2 border-slate-100 hover:border-emerald-200 group">
                <i className="pi pi-twitter text-emerald-600 text-xl group-hover:scale-110 transition-transform" />
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
