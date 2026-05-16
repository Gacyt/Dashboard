export function getWeekDates(baseDate: Date): Date[] {
  const current = new Date(baseDate);
  const day = current.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

export function weekStartId(baseDate: Date): string {
  return getWeekDates(baseDate)[0].toISOString().slice(0, 10);
}
