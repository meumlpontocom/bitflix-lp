/**
 * Slugify Brazilian-friendly: normaliza acentos, remove caracteres especiais,
 * tudo lowercase com `-` como separador.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}
