export function isOnline() {
  return navigator.onLine;
}

export function saveOffline(table: string, data: any) {
  const key = `offline_${table}`;

  const existing = JSON.parse(
    localStorage.getItem(key) || "[]"
  );

  existing.push(data);

  localStorage.setItem(
    key,
    JSON.stringify(existing)
  );
}

export function getOffline(table: string) {
  return JSON.parse(
    localStorage.getItem(`offline_${table}`) || "[]"
  );
}

export function clearOffline(table: string) {
  localStorage.removeItem(`offline_${table}`);
}