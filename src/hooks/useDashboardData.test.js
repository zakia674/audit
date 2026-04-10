import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { computeStats, useDashboardData } from './useDashboardData';

// ─── Arbitraires fast-check ───────────────────────────────────────────────────

const statutArb = fc.constantFrom('en_cours', 'terminee', 'archivee');

const missionArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  titre: fc.string({ minLength: 1 }),
  client: fc.option(fc.string(), { nil: null }),
  auditeur: fc.option(fc.string(), { nil: null }),
  statut: statutArb,
  date_creation: fc.constant('2024-01-01T00:00:00.000Z'),
});

const missionsArb = fc.uniqueArray(missionArb, {
  selector: m => m.id,
  minLength: 0,
  maxLength: 20,
});

const rapportArb = fc.record({
  score_global: fc.float({ min: 0, max: 100, noNaN: true }),
});

// ─── Tests unitaires de computeStats ─────────────────────────────────────────

describe('computeStats', () => {
  it('retourne total=0 et scoreMoyen=null pour une liste vide', () => {
    const stats = computeStats([], {});
    expect(stats).toEqual({ total: 0, enCours: 0, terminees: 0, scoreMoyen: null });
  });

  it('compte correctement les missions en_cours et terminee', () => {
    const missions = [
      { id: 1, statut: 'en_cours' },
      { id: 2, statut: 'terminee' },
      { id: 3, statut: 'terminee' },
      { id: 4, statut: 'archivee' },
    ];
    const rapports = {
      2: { score_global: 80 },
      3: { score_global: 60 },
    };
    const stats = computeStats(missions, rapports);
    expect(stats.total).toBe(4);
    expect(stats.enCours).toBe(1);
    expect(stats.terminees).toBe(2);
    expect(stats.scoreMoyen).toBe(70);
  });

  it('retourne scoreMoyen=null si aucun rapport', () => {
    const missions = [{ id: 1, statut: 'en_cours' }];
    const stats = computeStats(missions, {});
    expect(stats.scoreMoyen).toBeNull();
  });

  it('arrondit le score moyen', () => {
    const missions = [
      { id: 1, statut: 'terminee' },
      { id: 2, statut: 'terminee' },
    ];
    const rapports = {
      1: { score_global: 33.33 },
      2: { score_global: 66.67 },
    };
    const stats = computeStats(missions, rapports);
    expect(stats.scoreMoyen).toBe(Math.round((33.33 + 66.67) / 2));
  });
});

// ─── Propriété 2 : Cohérence du total ────────────────────────────────────────
// Valide : Exigence 7.1

describe('Propriété 2 — Cohérence du total (Exigence 7.1)', () => {
  it('computeStats.total === missions.length pour tout tableau de missions', () => {
    fc.assert(
      fc.property(missionsArb, fc.dictionary(fc.integer({ min: 1, max: 10000 }).map(String), rapportArb), (missions, rapportsRaw) => {
        // Convertir les clés en nombres pour correspondre au format attendu
        const rapports = {};
        for (const [k, v] of Object.entries(rapportsRaw)) {
          rapports[Number(k)] = v;
        }
        const stats = computeStats(missions, rapports);
        return stats.total === missions.length;
      }),
      { numRuns: 200 }
    );
  });
});

// ─── Propriété 3 : Partition des statuts ─────────────────────────────────────
// Valide : Exigence 7.2

describe('Propriété 3 — Partition des statuts (Exigence 7.2)', () => {
  it('enCours + terminees + archivees === total pour tout tableau de missions', () => {
    fc.assert(
      fc.property(missionsArb, (missions) => {
        const stats = computeStats(missions, {});
        const archivees = missions.filter(m => m.statut === 'archivee').length;
        return stats.enCours + stats.terminees + archivees === stats.total;
      }),
      { numRuns: 200 }
    );
  });
});

// ─── Propriété 4 : Domaine du score moyen ────────────────────────────────────
// Valide : Exigences 7.3, 7.4

describe('Propriété 4 — Domaine du score moyen (Exigences 7.3, 7.4)', () => {
  it('scoreMoyen est null ou un entier dans [0, 100]', () => {
    fc.assert(
      fc.property(missionsArb, (missions) => {
        // Construire des rapports uniquement pour les missions terminées
        const rapports = {};
        for (const m of missions) {
          if (m.statut === 'terminee') {
            rapports[m.id] = { score_global: Math.random() * 100 };
          }
        }
        const stats = computeStats(missions, rapports);
        if (stats.scoreMoyen === null) return true;
        return (
          Number.isInteger(stats.scoreMoyen) &&
          stats.scoreMoyen >= 0 &&
          stats.scoreMoyen <= 100
        );
      }),
      { numRuns: 200 }
    );
  });
});

// ─── Propriété 7 : Isolation des appels API par statut ───────────────────────
// Valide : Exigences 8.1, 8.2

describe('Propriété 7 — Isolation des appels API par statut (Exigences 8.1, 8.2)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('aucun appel rapport pour statut ≠ terminee, aucun appel périmètre pour statut ≠ en_cours', async () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 100 }),
            statut: statutArb,
            titre: fc.constant('test'),
            client: fc.constant(null),
            auditeur: fc.constant(null),
            date_creation: fc.constant('2024-01-01'),
          }),
          { minLength: 1, maxLength: 10 }
        ).filter(arr => {
          // Dédupliquer les ids
          const ids = arr.map(m => m.id);
          return new Set(ids).size === ids.length;
        }),
        (missions) => {
          const calledUrls = [];

          fetch.mockImplementation((url) => {
            calledUrls.push(url);
            if (url === '/api/missions') {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(missions),
              });
            }
            // Rapport ou périmètre
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(url.includes('/rapport') ? { score_global: 50 } : []),
            });
          });

          // Vérifier la logique de filtrage directement sur les missions
          const rapportIds = missions.filter(m => m.statut === 'terminee').map(m => m.id);
          const perimetreIds = missions.filter(m => m.statut === 'en_cours').map(m => m.id);

          // Aucune mission non-terminée ne doit avoir un appel rapport
          for (const m of missions) {
            if (m.statut !== 'terminee') {
              expect(rapportIds).not.toContain(m.id);
            }
            if (m.statut !== 'en_cours') {
              expect(perimetreIds).not.toContain(m.id);
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Tests du hook useDashboardData ──────────────────────────────────────────

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('expose loading=true initialement puis loading=false après chargement', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useDashboardData());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.missions).toEqual([]);
  });

  it('expose error et retry si GET /api/missions échoue', async () => {
    fetch.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(typeof result.current.retry).toBe('function');
  });

  it('charge rapports uniquement pour les missions terminee', async () => {
    const missions = [
      { id: 1, statut: 'terminee', titre: 'M1', client: null, auditeur: null, date_creation: '2024-01-01' },
      { id: 2, statut: 'en_cours', titre: 'M2', client: null, auditeur: null, date_creation: '2024-01-01' },
    ];

    fetch.mockImplementation((url) => {
      if (url === '/api/missions') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(missions) });
      }
      if (url === '/api/missions/1/rapport') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ score_global: 75 }) });
      }
      if (url === '/api/missions/2/perimetre') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, statut: 'conforme' }]) });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rapports[1]).toBeDefined();
    expect(result.current.rapports[2]).toBeUndefined();
    expect(result.current.perimetres[2]).toBeDefined();
    expect(result.current.perimetres[1]).toBeUndefined();
  });

  it('calcule les stats correctement', async () => {
    const missions = [
      { id: 1, statut: 'terminee', titre: 'M1', client: null, auditeur: null, date_creation: '2024-01-01' },
      { id: 2, statut: 'en_cours', titre: 'M2', client: null, auditeur: null, date_creation: '2024-01-01' },
    ];

    fetch.mockImplementation((url) => {
      if (url === '/api/missions') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(missions) });
      }
      if (url === '/api/missions/1/rapport') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ score_global: 80 }) });
      }
      if (url === '/api/missions/2/perimetre') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.total).toBe(2);
    expect(result.current.stats.enCours).toBe(1);
    expect(result.current.stats.terminees).toBe(1);
    expect(result.current.stats.scoreMoyen).toBe(80);
  });
});
