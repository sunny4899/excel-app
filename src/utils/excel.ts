import { read, utils, write } from 'xlsx';
import { ExcelFile } from '../types';

const isExcelDate = (value: any): boolean => {
  // Excel dates are stored as numbers representing days since 1900-01-01
  return typeof value === 'number' && !Number.isInteger(value) && value > 0;
};

const formatExcelDate = (value: number): string => {
  // Convert Excel date number to JavaScript Date
  const date = new Date((value - 25569) * 86400 * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const parseExcelFile = async (file: File): Promise<ExcelFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }

        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = read(data, { type: 'array', cellDates: false });

        const sheets: { [key: string]: { headers: string[], data: unknown[][] } } = {};
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,  // Use null for empty cells
            blankrows: true, // Keep empty rows
            raw: false // Get formatted strings for dates
          });

          if (sheetData.length === 0) {
            throw new Error(`Sheet '${sheetName}' is empty`);
          }

          const headers = (sheetData[0] as any[]).map(header => String(header || ''));
          const maxColumns = Math.max(...sheetData.map(row => (row as unknown[]).length));
          const normalizedData = sheetData.map(row => {
            const normalizedRow = [...(row as any[])];
            while (normalizedRow.length < maxColumns) {
              normalizedRow.push(null);
            }
            if (row !== sheetData[0]) {
              normalizedRow.forEach((value, index) => {
                if (isExcelDate(value)) {
                  normalizedRow[index] = formatExcelDate(value as number);
                }
              });
            }
            return normalizedRow;
          });

          sheets[sheetName] = { headers, data: normalizedData };
        });

        if (Object.keys(sheets).length === 0) {
          throw new Error('No valid worksheets found');
        }

        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          sheets,
          currentWorksheet: workbook.SheetNames[0],
          modified: false
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const downloadExcelFile = (file: ExcelFile) => {
  const workbook = utils.book_new();

  Object.entries(file.sheets).forEach(([sheetName, sheet]) => {
    const processedData = (sheet.data as any[][]).map((row, rowIndex) => {
      if (rowIndex === 0) return row; // Skip header row
      return row.map((cell) => {
        if (typeof cell === 'string' && cell.match(/^[A-Za-z]{3} \d{1,2}, \d{4}$/)) {
          // Convert date string back to Excel date number
          const date = new Date(cell);
          const excelDate = 25569 + date.getTime() / (86400 * 1000);
          return excelDate;
        }
        return cell;
      });
    });
    const worksheet = utils.aoa_to_sheet(processedData);
    utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Generate file and trigger download
  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.modified ? `modified_${file.name}` : file.name;
  a.click();

  URL.revokeObjectURL(url);
};

export const sortTableData = (data: Array<any[]>, colIndex: number): Array<any[]> => {
  if (data.length <= 1) return data;

  const headers = data[0] as unknown[];
  const rows = data.slice(1);

  const sortedRows = [...rows].sort((a: any[], b: any[]) => {
    const valueA = a[colIndex];
    const valueB = b[colIndex];

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      const dateA = new Date(valueA);
      const dateB = new Date(valueB);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      }
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return (valueA as number) - (valueB as number);
    }

    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();

    return strA.localeCompare(strB);
  });

  return [headers, ...sortedRows];
};
