 export const toStreamArgs = (obj: Record<string, any>) => {
  return Object.entries(obj).flatMap(([k, v]) => [k, String(v)]);
};