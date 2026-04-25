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
// SALLES (filtrées par site_id)
// =============================================
export const useSalles = (siteId?: number) => {
  return useQuery({
    queryKey: archivageKeys.salles(siteId),
    queryFn: async (): Promise<Salle[]> => {
      if (!siteId) return [];
      const response = await getSalles();
      const salles = Array.isArray(response) ? response : response?.salle || [];
      // ✅ Filtrer côté client si l'API ne supporte pas le filtre
      return salles.filter((s: Salle) => s.site_id === siteId);
    },
    enabled: !!siteId && siteId > 0, // ✅ Ne s'exécute que si siteId est valide
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// RAYONS (filtrés par salle_id)
// =============================================
export const useRayons = (salleId?: number) => {
  return useQuery({
    queryKey: archivageKeys.rayons(salleId),
    queryFn: async (): Promise<Rayon[]> => {
      if (!salleId) return [];
      const response = await getRayons();
      const rayons = Array.isArray(response) ? response : response?.rayon || [];
      return rayons.filter((r: Rayon) => r.salle_id === salleId);
    },
    enabled: !!salleId && salleId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// TRAVÉES (filtrées par rayon_id)
// =============================================
export const useTraves = (rayonId?: number) => {
  return useQuery({
    queryKey: archivageKeys.traves(rayonId),
    queryFn: async (): Promise<Trave[]> => {
      if (!rayonId) return [];
      const response = await getTraves();
      const traves = Array.isArray(response) ? response : response?.trave || [];
      return traves.filter((t: Trave) => t.rayon_id === rayonId);
    },
    enabled: !!rayonId && rayonId > 0,
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
