import Papa from 'papaparse';
import type { CsvRow } from '../types/csv';

export const parseCsvFile = (file: File): Promise<CsvRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const parsedData = results.data
          .filter((row: any[]) => row.length === 3 && row.every(cell => cell))
          .map((row: any[]) => ({
            english: row[0],
            phonetic: row[1],
            spanish: row[2]
          }));
        resolve(parsedData);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};