export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}
