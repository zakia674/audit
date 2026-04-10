import { useState, useEffect, useCallback } from "react";

const API_BASE = "/api";

async function apiFetch(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Calcule les statistiques globales à partir des missions et des rapports chargés.
 * @param {Array} missions - Liste des missions
 * @param {Object} rapports - Map mission_id → rapport
 * @returns {{ total: number, enCours: number, terminees: number, scoreMoyen: number|null }}
 */
export function computeStats(missions, rapports) {
  const total = missions.length;
  const enCours = missions.filter(m => m.statut === "en_cours").length;
  const terminees = missions.filter(m => m.statut === "terminee").length;

  const scores = missions
    .filter(m => rapports[m.id] != null)
    .map(m => rapports[m.id].score_global);

  const scoreMoyen =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : null;

  return { total, enCours, terminees, scoreMoyen };
}

/**
 * Hook de chargement des données du dashboard.
 * Charge les missions, puis en parallèle les rapports (missions terminées)
 * et les périmètres (missions en cours).
 *
 * @returns {{ missions, rapports, perimetres, stats, loading, error, retry }}
 */
export function useDashboardData() {
  const [missions, setMissions] = useState([]);
  const [rapports, setRapports] = useState({});
  const [perimetres, setPerimetres] = useState({});
  const [stats, setStats] = useState({ total: 0, enCours: 0, terminees: 0, scoreMoyen: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Charger toutes les missions
    const missionsData = await apiFetch("/missions");
    if (!missionsData) {
      setError("Impossible de charger les missions. Vérifiez que le serveur est disponible.");
      setLoading(false);
      return;
    }

    // 2. Lancer en parallèle les appels secondaires selon le statut
    const rapportPromises = missionsData
      .filter(m => m.statut === "terminee")
      .map(m =>
        apiFetch(`/missions/${m.id}/rapport`).then(r => ({ id: m.id, data: r }))
      );

    const perimetrePromises = missionsData
      .filter(m => m.statut === "en_cours")
      .map(m =>
        apiFetch(`/missions/${m.id}/perimetre`).then(p => ({ id: m.id, data: p }))
      );

    const [rapportResults, perimetreResults] = await Promise.all([
      Promise.all(rapportPromises),
      Promise.all(perimetrePromises),
    ]);

    // 3. Construire les maps rapports et périmètres
    const newRapports = {};
    for (const { id, data } of rapportResults) {
      if (data != null) {
        newRapports[id] = data;
      }
    }

    const newPerimetres = {};
    for (const { id, data } of perimetreResults) {
      if (data != null && Array.isArray(data) && data.length > 0) {
        const evalues = data.filter(c => c.statut != null).length;
        newPerimetres[id] = {
          totalControles: data.length,
          evalues,
          progressPercent: Math.round((evalues / data.length) * 100),
        };
      }
    }

    // 4. Calculer les stats
    const newStats = computeStats(missionsData, newRapports);

    setMissions(missionsData);
    setRapports(newRapports);
    setPerimetres(newPerimetres);
    setStats(newStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { missions, setMissions, rapports, perimetres, stats, loading, error, retry: load };
}
