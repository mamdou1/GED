import React, { ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthSwitcher from "../pages/Auth/AuthSwitcher";
import Pieces from "../pages/Pieces/PiecesPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Membre from "../pages/Membres/UserPage";
import ExercicePage from "../pages/Exercice/ExercicePage";
import RecherchePage from "../pages/Recherche/Recherche";
import DroitPage from "../pages/Droit/DroitPage";
import { useAuth } from "../context/AuthContext";
import HistoriquePage from "../pages/HistoriqueLog/HistoriquePage";
import DocumentPage from "../pages/Document/DocumentPage";
import ConfigurationStructure from "../pages/Organigrame/ConfigurationStructure";
import EntiteeUnPage from "../pages/Organigrame/EntiteeUn/EntiteeUnPage";
import EntiteeDeuxPage from "../pages/Organigrame/EntiteeDeux/EntiteeDeuxPage";
import EntiteeTroisPage from "../pages/Organigrame/EntiteeTrois/EntiteeTroisPage";
import BoxPage from "../pages/Box/BoxPage";
import RayonPage from "../pages/Rayon/RayonPage";
import SallePage from "../pages/Salle/SallePage";
import TravePage from "../pages/Trave/TravePage";
import SitePage from "../pages/Site/SitePage";
import DocumentTypeEntitee from "../pages/DomentType/DocumentTypeEntitee";
import WelcomeLandingPage from "../pages/Dashboard/DashbordBis";
import ChangePassword from "../pages/Auth/ChangePassword";
import SendEmail from "../pages/Auth/SendEmail";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import UpdatePassword from "../pages/Auth/UpdatePassword";
import FonctionPage from "../pages/Fonction/FonctionPage";

// 🔥 IMPORTATION COURRIER
import CourrierPage from "../pages/Courrier/CourrierPage";
import MesCourriers from "../pages/Courrier/MesCourriers";
import NouveauCourrier from "../pages/Courrier/Enregitrement";
import ExpediteursPage from "../pages/Courrier/ExpediteursPage";
import DestinatairesExternesPage from "../pages/Courrier/DestinatairePage";

const PrivateRoute: React.FC<{ children: ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!user) return <Navigate to="/connexion" replace />;

  return children;
};

export default function AppRouter() {
  const { can, loading } = useAuth();
  if (loading) return <div>Chargement...</div>;

  return (
    <Routes>
      <Route path="/connexion" element={<AuthSwitcher />} />
      <Route path="/send-code" element={<SendEmail />} />
      <Route path="/verify-code" element={<VerifyEmail />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            {can("statistique", "read") ? (
              <Dashboard />
            ) : (
              <Navigate to="/welcome" replace />
            )}
          </PrivateRoute>
        }
      />
      <Route
        path="/welcome"
        element={
          <PrivateRoute>
            <WelcomeLandingPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/agents"
        element={
          <PrivateRoute>
            <Membre />
          </PrivateRoute>
        }
      />

      <Route
        path="/exercices"
        element={
          <PrivateRoute>
            <ExercicePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/pieces"
        element={
          <PrivateRoute>
            <Pieces />
          </PrivateRoute>
        }
      />
      <Route
        path="/recherche"
        element={
          <PrivateRoute>
            <RecherchePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profils"
        element={
          <PrivateRoute>
            <DroitPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/historique"
        element={
          <PrivateRoute>
            <HistoriquePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/document"
        element={
          <PrivateRoute>
            <DocumentPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dossierType"
        element={
          <PrivateRoute>
            <DocumentTypeEntitee />
          </PrivateRoute>
        }
      />
      <Route
        path="/organigrame"
        element={
          <PrivateRoute>
            <ConfigurationStructure />
          </PrivateRoute>
        }
      />

      <Route
        path="/entiteeUn"
        element={
          <PrivateRoute>
            <EntiteeUnPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/entiteeDeux"
        element={
          <PrivateRoute>
            <EntiteeDeuxPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/entiteeTrois"
        element={
          <PrivateRoute>
            <EntiteeTroisPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/box"
        element={
          <PrivateRoute>
            <BoxPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/rayon"
        element={
          <PrivateRoute>
            <RayonPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/salle"
        element={
          <PrivateRoute>
            <SallePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/trave"
        element={
          <PrivateRoute>
            <TravePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/site"
        element={
          <PrivateRoute>
            <SitePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        }
      />
      <Route
        path="/fonction"
        element={
          <PrivateRoute>
            <FonctionPage />
          </PrivateRoute>
        }
      />

      {/* ================= ROUTES COURRIER ================= */}
      <Route
        path="/courrier"
        element={
          <PrivateRoute>
            <CourrierPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/courrier/mes-attribues"
        element={
          <PrivateRoute>
            <MesCourriers />
          </PrivateRoute>
        }
      />

      <Route
        path="/courrier/nouveau"
        element={
          <PrivateRoute>
            <NouveauCourrier />
          </PrivateRoute>
        }
      />
      <Route
        path="/courrier/expediteur"
        element={
          <PrivateRoute>
            <ExpediteursPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/courrier/destinataire"
        element={
          <PrivateRoute>
            <DestinatairesExternesPage />
          </PrivateRoute>
        }
      />



    </Routes>
  );
}