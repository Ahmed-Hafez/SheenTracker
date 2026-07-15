export function getInitialsFromName(name: string | null | undefined, limit = 2): string {
  if (!name) {
    return '';
  }

  const matches = name.trim().match(/\b\w/g);
  return matches ? matches.slice(0, limit).join('').toUpperCase() : '';
}
