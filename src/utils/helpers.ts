export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

type TrackLike = Record<string, unknown>;

export function getUniqueValuesFromTracks<T extends TrackLike>(arr: T[], key: keyof T): string[] {
  if (!Array.isArray(arr)) return [];
  
  const uniqueValues = new Set<string>();
  
  arr.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    
    const value = item[key];
    
    if (Array.isArray(value)) {
      (value as unknown[]).forEach((v) => {
        if (v != null && String(v).trim() !== '') {
          uniqueValues.add(String(v));
        }
      });
    } else if (value != null && String(value).trim() !== '') {
      uniqueValues.add(String(value));
    }
  });
  
  return Array.from(uniqueValues).sort();
}