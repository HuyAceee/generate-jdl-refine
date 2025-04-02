export function toCamelCase(str: string) {
  return str
    .replace(/_./g, match => match.charAt(1).toUpperCase())
    .replace(/-/g, '')
    .replace(/^./, match => match.toLowerCase());
}

export function toKebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function pluralize(str: string) {
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
  if (str.endsWith('s')) return str + 'es';
  return str + 's';
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
