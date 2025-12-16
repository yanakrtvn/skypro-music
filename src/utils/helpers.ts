export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getUniqueValuesFromTracks<T extends object>(arr: T[], key: keyof T): string[] {
  const uniqueValues = new Set<string>();
  
  arr.forEach((item) => {
    const value = item[key] as unknown;
    
    if (Array.isArray(value)) {
      (value as string[]).forEach((v) => {
        if (v) uniqueValues.add(v);
      });
    } else if (typeof value === 'string') {
      uniqueValues.add(value);
    } else if (typeof value === 'number') {
      uniqueValues.add(value.toString());
    }
  });
  
  return Array.from(uniqueValues).sort();
}