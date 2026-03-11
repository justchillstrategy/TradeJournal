/**
 * Formats a date string (YYYY-MM-DD) to DD-MM-YYYY
 * @param {string} isoDate 
 * @returns {string}
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}
