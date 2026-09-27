/**
 * Choropleth fill color for a kecamatan polygon, keyed to the count shown
 * (player or club count depending on the active toggle). Thresholds and
 * colors as specified: neutral for zero, ramping up to full PBPI red.
 */
export function fillForCount(count: number): string {
  if (count <= 0) return '#EDEEEC' // light neutral
  if (count <= 5) return '#F3B7BC' // light red
  if (count <= 10) return '#E37C85' // medium red
  if (count <= 20) return '#D33E4A' // strong red
  return '#C81E2C' // PBPI red
}
