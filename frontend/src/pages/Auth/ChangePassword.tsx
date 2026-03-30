// ChangePassword.tsx - Sans setUser
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../api/users";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Key,
  Save,
  ArrowLeft,
  UserRound,
} from "lucide-react";
import {
  changePassword,
  isStrongPassword,
  getPasswordStrength,
} from "../../api/auth";
import Layout from "../../components/layout/Layoutt";
import api from "../../api/axios";

export default function ChangePassword() {
  const { user, setUser } = useAuth(); // ✅ Sans setUser
  const navigate = useNavigate();

  // États pour le username
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // États pour le mot de passe
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const toast = useRef<Toast>(null);

  // ✅ Charger le username de l'utilisateur connecté
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
    }
  }, [user]);

  // Fonction pour rafraîchir les données utilisateur
  const refreshUserData = async () => {
    try {
      const response = await api.get("/user/me");
      const userData = response.data;
      
      // ✅ Mettre à jour le contexte ET le localStorage
      setUser(userData); // Mettre à jour le contexte
      localStorage.setItem("user", JSON.stringify(userData));
            
      console.log("✅ Utilisateur mis à jour:", userData);
      
    } catch (error) {
      console.error("❌ Erreur rafraîchissement utilisateur:", error);
    }
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Vérifier l'ancien mot de passe (seulement si un nouveau est fourni)
    if (newPassword && !oldPassword) {
      newErrors.oldPassword =
        "L'ancien mot de passe est requis pour le changer";
    }

    // Vérifier le nouveau mot de passe (si fourni)
    if (newPassword) {
      if (newPassword.length < 8) {
        newErrors.newPassword =
          "Le mot de passe doit contenir au moins 8 caractères";
      } else if (!isStrongPassword(newPassword)) {
        newErrors.newPassword =
          "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial";
      }

      // Vérifier la confirmation (si nouveau mot de passe fourni)
      if (!confirmPassword) {
        newErrors.confirmPassword = "La confirmation est requise";
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("=".repeat(50));
    console.log("🔐 SUBMIT - Mise à jour du profil");

    if (!validateForm()) {
      console.log("❌ Validation du formulaire échouée");
      return;
    }

    setLoading(true);
    try {
      let hasChanges = false;

      // ✅ 1. Mettre à jour le username si modifié
      if (username !== user?.username) {
        console.log("📝 Mise à jour du username:", username);

        if (!user?.id) {
          throw new Error("Utilisateur non identifié");
        }

        await updateUser(
          { username },
          user.id,
          undefined, // Pas de photo
        );

        hasChanges = true;

        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Nom d'utilisateur mis à jour",
          life: 3000,
        });
      }

      // ✅ 2. Changer le mot de passe si fourni
      if (newPassword) {
        console.log("🔑 Changement du mot de passe");
        await changePassword({ oldPassword, newPassword });

        hasChanges = true;

        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail: "Mot de passe modifié avec succès",
          life: 3000,
        });
      }

      if (hasChanges) {
        console.log("✅ Mise à jour réussie");

        // ✅ Rafraîchir les données utilisateur
        await refreshUserData();
      }

      // Redirection après succès
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error: any) {
      console.error("❌ ERREUR:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour";

      setErrors({ general: errorMessage });

      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: errorMessage,
        life: 5001,
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtenir la force du mot de passe
  const passwordStrength = getPasswordStrength(newPassword);

  // Vérifier si les mots de passe correspondent
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <Layout>
      <Toast ref={toast} position="top-center" />

      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all group"
            title="Retour"
          >
            <ArrowLeft
              size={20}
              className="text-emerald-700 group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div>
            <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
                <Lock size={24} />
              </div>
              Modifier mon profil
            </h1>
            <p className="text-emerald-600/70 text-sm mt-1 ml-16">
              Mettez à jour vos informations de connexion
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Message d'erreur général */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {errors.general}
                </p>
              </div>
            )}

            {/* SECTION INFORMATIONS DU COMPTE */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2 border-b border-emerald-100 pb-2">
                <UserRound size={20} className="text-emerald-600" />
                Informations du compte
              </h2>

              {/* Nom d'utilisateur (modifiable) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <UserRound size={14} className="text-emerald-500" />
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre nom d'utilisateur"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm ${
                      usernameError
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : username !== user?.username
                          ? "border-amber-400 bg-amber-50/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    }`}
                  />
                </div>
                {username !== user?.username && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Modification en attente
                  </p>
                )}
              </div>
            </div>

            <Divider className="my-6" />

            {/* SECTION CHANGEMENT DE MOT DE PASSE */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2 border-b border-emerald-100 pb-2">
                <Lock size={20} className="text-emerald-600" />
                Changer le mot de passe
              </h2>
              <p className="text-xs text-slate-500 mb-2">
                Laissez ces champs vides si vous ne souhaitez pas changer votre
                mot de passe.
              </p>

              {/* Ancien mot de passe */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <Key size={14} className="text-emerald-500" />
                  Ancien mot de passe
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Requis seulement pour changer le mot de passe"
                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm ${
                      errors.oldPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : oldPassword
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.oldPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <XCircle size={12} />
                    {errors.oldPassword}
                  </p>
                )}
              </div>

              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <Shield size={14} className="text-emerald-500" />
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Laissez vide pour ne pas changer"
                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm ${
                      errors.newPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : newPassword
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indicateur de force du mot de passe */}
                {newPassword && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Force du mot de passe:
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          passwordStrength.score <= 1
                            ? "bg-red-100 text-red-700"
                            : passwordStrength.score === 2
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {passwordStrength.message}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.score + 1) * 20}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <XCircle size={12} />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirmation du nouveau mot de passe */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : passwordsMatch && confirmPassword
                          ? "border-emerald-500 bg-emerald-50/50"
                          : confirmPassword
                            ? "border-amber-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Indicateur de correspondance */}
                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-medium">
                          Les mots de passe correspondent
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="text-red-500" />
                        <span className="text-xs text-red-500 font-medium">
                          Les mots de passe ne correspondent pas
                        </span>
                      </>
                    )}
                  </div>
                )}

                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <XCircle size={12} />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Conseils de sécurité */}
            {newPassword && (
              <div className="mt-6 p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-3">
                  Conseils de sécurité
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  {/*<li className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        newPassword.length >= 8
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />
                    Au moins 8 caractères
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        /[A-Z]/.test(newPassword)
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />
                    Une majuscule
                  </li>*/}
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        /[a-z]/.test(newPassword)
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />
                    Une minuscule
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        /\d/.test(newPassword)
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />
                    Un chiffre
                  </li>
                  {/*<li className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />
                    Un caractère spécial
                  </li>*/}
                </ul>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 p-6 bg-slate-50/50 border-t border-emerald-100">
            <Button
              label="Annuler"
              icon={<ArrowLeft size={16} className="mr-2" />}
              onClick={() => navigate(-1)}
              className="p-button-text text-slate-600 font-bold hover:bg-slate-100 px-6 py-3 rounded-xl"
              disabled={loading}
            />
            <Button
              label={loading ? "Enregistrement..." : "Enregistrer"}
              icon={<Save size={16} className="mr-2" />}
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all font-bold"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}