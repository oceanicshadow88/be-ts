import * as path from 'path';

export const getSourceFileFromStack = (stack?: string): string | undefined => {
    if (!stack) {
      return undefined;
    }
  
    const lines = stack.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/\s*(?:at .*?\(([^:]+):\d+:\d+\)|at ([^:]+):\d+:\d+)/);
  
      let filePath: string | undefined;
      if (match) {
        filePath = match[1] || match[2];
      }
  
      if (filePath) {
        filePath = filePath.trim();
        if ((filePath.endsWith('.ts') || filePath.endsWith('.js'))) {
          return path.basename(filePath);
        }
      }
    }
    return undefined;
}