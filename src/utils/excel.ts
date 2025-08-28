import { read, utils, write } from "xlsx";
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
  }
}
import { ExcelFile } from "../types";

const isExcelDate = (value: unknown): boolean => {
  // Excel dates are stored as numbers representing days since 1900-01-01
  return typeof value === "number" && !Number.isInteger(value) && value > 0;
};

const formatExcelDate = (value: number): string => {
  // Convert Excel date number to JavaScript Date
  const date = new Date((value - 25569) * 86400 * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const parseExcelFile = async (file: File): Promise<ExcelFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file");
        }

        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = read(data, { type: "array", cellDates: false });

        const sheets: {
          [key: string]: {
            headers: string[];
            data: (string | number | Date | null)[][];
          };
        } = {};
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null, // Use null for empty cells
            blankrows: true, // Keep empty rows
            raw: false, // Get formatted strings for dates
          });

          if (sheetData.length === 0) {
            throw new Error(`Sheet '${sheetName}' is empty`);
          }

          const headers = (sheetData[0] as any[]).map((header) =>
            String(header || "")
          );
          const maxColumns = Math.max(
            ...sheetData.map((row) => (row as unknown[]).length)
          );
          const normalizedData = sheetData.map((row) => {
            const normalizedRow = [...(row as any[])];
            while (normalizedRow.length < maxColumns) {
              normalizedRow.push(null);
            }
            if (row !== sheetData[0]) {
              normalizedRow.forEach((value, index) => {
                if (typeof value === "number" && isExcelDate(value)) {
                  normalizedRow[index] = formatExcelDate(value);
                }
              });
            }
            return normalizedRow;
          });

          sheets[sheetName] = { headers, data: normalizedData };
        });

        if (Object.keys(sheets).length === 0) {
          throw new Error("No valid worksheets found");
        }

        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          sheets,
          currentWorksheet: workbook.SheetNames[0],
          modified: false,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const exportFile = async (
  file: ExcelFile,
  format: "xlsx" | "csv" | "json" | "pdf" = "xlsx"
) => {
  const workbook = utils.book_new();

  Object.entries(file.sheets).forEach(([sheetName, sheet]) => {
    const processedData = (
      sheet.data as (string | number | Date | null)[][]
    ).map((row, rowIndex) => {
      if (rowIndex === 0) return row; // Skip header row
      return row.map((cell) => {
        if (
          typeof cell === "string" &&
          cell.match(/^[A-Za-z]{3} \d{1,2}, \d{4}$/)
        ) {
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
  let blob: Blob;
  let extension: string;
  let mimeType: string;

  if (format === "pdf") {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = await import("jspdf-autotable");
    const doc = new jsPDF();

    Object.entries(file.sheets).forEach(([sheetName, sheet], index) => {
      if (index > 0) doc.addPage();

      // Add sheet title
      doc.setFontSize(16);
      doc.text(sheetName, 14, 16);

      // Convert data to strings and handle null values
      const bodyData = sheet.data.slice(1).map((row) =>
        row.map((cell) => {
          if (cell === null || cell === undefined) return "";
          if (cell instanceof Date) return cell.toLocaleDateString();
          return String(cell);
        })
      );

      autoTable.default(doc, {
        head: [sheet.headers],
        body: bodyData,
        startY: 22,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185] },
      });
    });

    blob = doc.output("blob");
    extension = "pdf";
    mimeType = "application/pdf";
  } else {
    let data: string | ArrayBuffer;
    if (format === "csv") {
      data = utils.sheet_to_csv(workbook.Sheets[file.currentWorksheet]);
    } else if (format === "json") {
      data = JSON.stringify(
        utils.sheet_to_json(workbook.Sheets[file.currentWorksheet]),
        null,
        2
      );
    } else {
      data = write(workbook, { bookType: format, type: "array" });
    }

    mimeType = {
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      csv: "text/csv",
      json: "application/json",
    }[format];

    blob = new Blob([data], { type: mimeType });
    extension = format;
  }

  const filename = `${file.modified ? "modified_" : ""}${file.name.replace(
    /\.[^/.]+$/,
    ""
  )}.${extension}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const sortTableData = (
  data: Array<(string | number | Date | null)[]>,
  colIndex: number
): Array<(string | number | Date | null)[]> => {
  if (data.length <= 1) return data;

  const headers = data[0] as (string | number | Date | null)[];
  const rows = data.slice(1);

  const sortedRows = [...rows].sort(
    (
      a: (string | number | Date | null)[],
      b: (string | number | Date | null)[]
    ) => {
      const valueA = a[colIndex];
      const valueB = b[colIndex];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1;
      if (valueB == null) return -1;

      const numA = parseFloat(String(valueA));
      const numB = parseFloat(String(valueB));

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA.getTime() - dateB.getTime();
        }
      }

      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      return strA.localeCompare(strB);
    }
  );

  return [headers, ...sortedRows];
};
