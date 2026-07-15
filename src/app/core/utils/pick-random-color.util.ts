export function pickRandomColor(name: string | null | undefined, fontSize = '10px'): string {
  const colors = [
    `background-color: #F87171; color: white; font-size: ${fontSize};`,
    `background-color: #60A5FA; color: white; font-size: ${fontSize};`,
    `background-color: #34D399; color: white; font-size: ${fontSize};`,
    `background-color: #FBBF24; color: white; font-size: ${fontSize};`,
    `background-color: #A78BFA; color: white; font-size: ${fontSize};`,
    `background-color: #F472B6; color: white; font-size: ${fontSize};`,
  ];

  const value = name ?? '';
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
