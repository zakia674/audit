/**
 * Calcule le score de conformité global.
 * @param {number} conformes
 * @param {number} partiels
 * @param {number} non_conformes
 * @returns {number} score dans [0, 100]
 */
export function computeScoreGlobal(conformes, partiels, non_conformes) {
  const total = conformes + partiels + non_conformes;
  if (total === 0) return 0;
  return Math.round(((conformes + partiels * 0.5) / total) * 100 * 10) / 10;
}

/**
 * Retourne la couleur d'une barre selon le score.
 * @param {number} score
 * @returns {string} couleur hex
 */
export function getBarColor(score) {
  if (score < 50) return '#ef4444';
  if (score <= 80) return '#f97316';
  return '#22c55e';
}

/**
 * Retourne la colonne (0-3) dans la matrice de risque selon le nombre d'incidents.
 * @param {number} count
 * @returns {number} 0 | 1 | 2 | 3
 */
export function getColumn(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

/**
 * Formate un mois YYYY-MM en MMM YYYY (fr-FR).
 * @param {string} mois - format 'YYYY-MM'
 * @returns {string}
 */
export function formatMois(mois) {
  const [year, month] = mois.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
}
