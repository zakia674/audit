import { useState, useEffect } from 'react';

/**
 * Hook de chargement des statistiques analytiques du dashboard.
 * Appel unique à GET /api/dashboard/stats au montage.
 * Indépendant de useDashboardData.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/api/dashboard/stats')
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.detail || e.error || `HTTP ${res.status}`); });
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError('Impossible de charger les statistiques analytiques.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
}
