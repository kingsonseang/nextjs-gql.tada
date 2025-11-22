/**
 * Utility functions for Pokemon image URLs
 * Uses PokeAPI sprite format
 */

/**
 * Converts Pokemon ID to numeric ID for image URL
 * Pokemon IDs are typically 3-digit strings like "001", "025", etc.
 */
export function getPokemonImageId(id: string): number {
  // Remove leading zeros and convert to number
  return parseInt(id, 10);
}

/**
 * Gets the official Pokemon sprite image URL from PokeAPI
 * @param id - Pokemon ID (e.g., "001", "025")
 * @returns Image URL
 */
export function getPokemonImageUrl(id: string): string {
  const numericId = getPokemonImageId(id);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png`;
}

/**
 * Gets a fallback image URL if the main image fails to load
 * @param id - Pokemon ID
 * @returns Fallback image URL
 */
export function getPokemonFallbackImageUrl(id: string): string {
  const numericId = getPokemonImageId(id);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${numericId}.png`;
}

