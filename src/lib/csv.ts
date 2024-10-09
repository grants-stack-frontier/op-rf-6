import { parse, unparse, type UnparseConfig } from 'papaparse';

export function parseCSV<T>(file: string) {
  return parse<T>(file, { header: true });
}
export function format(data: unknown[], config: UnparseConfig) {
  return unparse(data, config);
}
