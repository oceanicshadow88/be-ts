export {};

declare global {
  interface Array<T> {
    groupBy<K extends keyof T>(key: K, missingKeyName?: string): Record<string, T[]>;
  }
}

Object.defineProperty(Array.prototype, 'groupBy', {
  value: function <T, K extends keyof T>(
    key: K,
    missingKeyName: string = 'undefined',
  ): Record<string, T[]> {
    // The original array (`this`) is not modified; a new object is returned
    return this.reduce((acc: Record<string, T[]>, item: T) => {
      const groupKey = (item[key] ?? missingKeyName) as string; // Ensure the key is a string
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {});
  },
  writable: true,
  configurable: true,
});
