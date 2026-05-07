const crcFormatter = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  minimumFractionDigits: 2
});

export function formatCRC(value: number) {
  return crcFormatter.format(value);
}
