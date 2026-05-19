/** Random numeric password (default 6 digits, 000000–999999). */
export function generateNumericPassword(length = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}
