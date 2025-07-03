import { createHash } from 'crypto';

export const hash = (str: string): string => {
  return createHash('sha256').update(str).digest('hex');
};
