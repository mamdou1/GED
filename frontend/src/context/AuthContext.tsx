import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import type { User } from "../interfaces";
import type { InscriptionPayload } from "../interfaces";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  permissions: string[];
  can: (resource: string, action?: string) => boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  inscription: (data: InscriptionPayload) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setloading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  const can = (resource: string, action?: string) => {
    if (!permissions.length) return false;

    if (action) {
      //console.log("if action", permissions.includes(`${resource}.${action}`));
      return permissions.includes(`${resource}.${action}`);
    }

    console.log(
      "some",
      permissions.some((p) => p.startsWith(resource + ".")),
    );
    return permissions.some((p) => p.startsWith(resource + "."));
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const storedPerms = localStorage.getItem("permissions");

    if (stored) setUser(JSON.parse(stored));
    if (storedPerms) setPermissions(JSON.parse(storedPerms));

    setloading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post("/auth/connexion", { username, password });
    const { accessToken } = res.data;
    localStorage.setItem("accessToken", accessToken);
    // récupérer user connecté via /user/me

    const me = await api.get("/user/me");
    console.log("me", me);

    const perms =
      me.data?.droit?.Permissions?.map(
        (p: any) => `${p.resource}.${p.action}`,
      ) || [];

    setPermissions(perms);
    setUser(me.data);

    localStorage.setItem("user", JSON.stringify(me.data));
    localStorage.setItem("permissions", JSON.stringify(perms));

    // const me = await api.get("/user/me");
    // setUser(me.data);
    // localStorage.setItem("user", JSON.stringify(me.data));
  };

  const logout = async () => {
    try {
      await api.post("/auth/deconnexion");
    } catch (err) {
      console.error("Erreur logout backend:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");

      setUser(null);
      setPermissions([]);
    }
  };

  const inscription = async (data: InscriptionPayload) => {
    try {
      const res = await api.post("/auth", data);
      console.log("✅ Inscription réussie :", res.data);
    } catch (error: any) {
      console.error("❌ Erreur d'inscription :", error.response?.data || error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        permissions,
        can,
        login,
        logout,
        inscription,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth doit être utilisé doit dans un AuthProvider");
  return context;
};
