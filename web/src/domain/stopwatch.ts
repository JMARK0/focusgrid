export function formatSeconds(millis: number): string {
  const totalTenths = Math.floor(millis / 100);
  const seconds = Math.floor(totalTenths / 10);
  const tenths = totalTenths % 10;
  return `${seconds}.${tenths}s`;
}
