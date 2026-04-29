// hooks/useArchivageQueries.ts
import { useQuery } from "@tanstack/react-query";
import { getSites } from "../api/site";
import { getSalles } from "../api/salle";
import { getRayons } from "../api/rayon";
import { getTraves } from "../api/trave";
import { getBoxes } from "../api/box";
import type { Site, Salle, Rayon, Trave, Box } from "../interfaces";

export const archivageKeys = {
  sites: ["sites"] as const,
  salles: (siteId?: number) => ["salles", { siteId }] as const,
  rayons: (salleId?: number) => ["rayons", { salleId }] as const,
  traves: (rayonId?: number) => ["traves", { rayonId }] as const,
  boxes: ["boxes"] as const,
};

// =============================================
// SITES (toujours chargés)
// =============================================
export const useSites = () => {
  return useQuery({
    queryKey: archivageKeys.sites,
    queryFn: async (): Promise<Site[]> => {
      const response = await getSites();
      return Array.isArray(response) ? response : response?.site || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
  });
};

// =============================================
// SALLES (filtrées par site_id, ou toutes si pas de filtre)
// =============================================
export const useSalles = (siteId?: number) => {
  return useQuery({
    queryKey: archivageKeys.salles(siteId),
    queryFn: async (): Promise<Salle[]> => {
      const response = await getSalles();
      const salles = Array.isArray(response) ? response : response?.salle || [];
      // ✅ Si siteId est fourni, filtrer ; sinon retourner tout
      if (siteId && siteId > 0) {
        return salles.filter((s: Salle) => s.site_id === siteId);
      }
      return salles;
    },
    // ✅ Toujours activé, mais avec un filtre optionnel
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// RAYONS (filtrés par salle_id, ou tous si pas de filtre)
// =============================================
export const useRayons = (salleId?: number) => {
  return useQuery({
    queryKey: archivageKeys.rayons(salleId),
    queryFn: async (): Promise<Rayon[]> => {
      const response = await getRayons();
      const rayons = Array.isArray(response) ? response : response?.rayon || [];
      if (salleId && salleId > 0) {
        return rayons.filter((r: Rayon) => r.salle_id === salleId);
      }
      return rayons;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// TRAVÉES (filtrées par rayon_id, ou toutes si pas de filtre)
// =============================================
export const useTraves = (rayonId?: number) => {
  return useQuery({
    queryKey: archivageKeys.traves(rayonId),
    queryFn: async (): Promise<Trave[]> => {
      const response = await getTraves();
      const traves = Array.isArray(response) ? response : response?.trave || [];
      if (rayonId && rayonId > 0) {
        return traves.filter((t: Trave) => t.rayon_id === rayonId);
      }
      return traves;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// BOXES (inchangé)
// =============================================
export const useBoxes = () => {
  return useQuery({
    queryKey: archivageKeys.boxes,
    queryFn: async (): Promise<Box[]> => {
      const response = await getBoxes();
      return Array.isArray(response) ? response : response?.box || [];
    },
  });
};
