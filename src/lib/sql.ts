// SQL injection protection utility
export function escapeSQL(str: string): string {
  return str.replace(/'/g, "''").slice(0, 255);  // Prevent long injection strings
}