export function formatCRC(amount: number): string {
  return "₡" + Math.round(amount).toLocaleString("es-CR");
}
