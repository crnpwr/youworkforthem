import { selectIndividualMPCircle } from './interactions.js';

export function weightedRandomSelect(array, weightField) {
  const total = array.reduce((sum, item) => sum + (item[weightField] || 0), 0);
  if (total === 0) return null;
  let r = Math.random() * total;
  for (const item of array) {
    r -= (item[weightField] || 0);
    if (r < 0) return item;
  }
  return array[array.length - 1];
}

// Weighted random MP highlight function
export function highlightRandomMp(mpData) {
    // Weighted random selection
    const total = mpData.reduce((sum, mp) => sum + (mp["Interesting Score"] || 0), 0);
    if (total === 0) return;
    let r = Math.random() * total;
    for (const mp of mpData) {
        r -= (mp["Interesting Score"] || 0);
        if (r < 0) {
            selectIndividualMPCircle(mp);
            return;
        }
    }
    // Fallback in case of rounding errors
    selectIndividualMPCircle(mpData[mpData.length - 1]);
}