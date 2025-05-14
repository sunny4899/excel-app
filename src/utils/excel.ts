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
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON with empty cells preserved
        const jsonData = utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: null,  // Use null for empty cells
          blankrows: true, // Keep empty rows
          raw: false // Get formatted strings for dates
        });
        
        if (jsonData.length === 0) {
          throw new Error('Excel file is empty');
        }
        
        // Extract headers from the first row
        const headers = (jsonData[0] as any[]).map(header => header || '');
        
        // Ensure all rows have the same number of columns and format dates
        const maxColumns = Math.max(...jsonData.map(row => (row as any[]).length));
        const normalizedData = jsonData.map(row => {
          const normalizedRow = [...(row as any[])];
          while (normalizedRow.length < maxColumns) {
            normalizedRow.push(null);
          }
          // Format dates in the data rows (skip header row)
          if (row !== jsonData[0]) {
            normalizedRow.forEach((value, index) => {
              if (isExcelDate(value)) {
                normalizedRow[index] = formatExcelDate(value);
              }
            });
          }
          return normalizedRow;
        });
        
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          data: normalizedData,
          headers,
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
  // Convert string dates back to Excel dates for saving
  const processedData = file.data.map((row, rowIndex) => {
    if (rowIndex === 0) return row; // Skip header row
    return row.map(cell => {
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
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
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

export const sortTableData = (data: Array<Array<any>>, colIndex: number): Array<Array<any>> => {
  if (data.length <= 1) return data;
  
  // Extract headers (first row)
  const headers = data[0];
  // Extract data rows (all rows except first)
  const rows = data.slice(1);
  
  // Sort the data rows based on the selected column
  const sortedRows = [...rows].sort((a, b) => {
    const valueA = a[colIndex];
    const valueB = b[colIndex];
    
    // Handle null/undefined values
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;
    
    // Handle date strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      const dateA = new Date(valueA);
      const dateB = new Date(valueB);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      }
    }
    
    // Handle different data types
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return valueA - valueB;
    }
    
    // Convert to string for comparison
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();
    
    return strA.localeCompare(strB);
  });
  
  // Return headers and sorted rows
  return [headers, ...sortedRows];
};