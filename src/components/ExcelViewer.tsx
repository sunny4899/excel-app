import { useState } from "react";
import { ExcelViewerProps } from "../types";
import TableCell from "./TableCell";
import { sortTableData, exportFile } from "../utils/excel";
import { Search, Download, Info } from "lucide-react";

const ExcelViewer: React.FC<ExcelViewerProps> = ({ file, updateFile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  if (!file) return null;

  // Use the current worksheet's data
  const currentSheet = file.sheets[file.currentWorksheet];
  const sheetData = currentSheet.data;

  const updateCell = (
    rowIndex: number,
    colIndex: number,
    value: string | number | Date | null
  ) => {
    const newData = [...sheetData];
    newData[rowIndex][colIndex] = value;

    updateFile({
      ...file,
      sheets: {
        ...file.sheets,
        [file.currentWorksheet]: {
          ...currentSheet,
          data: newData,
        },
      },
      modified: true,
    });
  };

  const sortColumn = (colIndex: number) => {
    const sortedData = sortTableData(sheetData, colIndex);

    updateFile({
      ...file,
      sheets: {
        ...file.sheets,
        [file.currentWorksheet]: {
          ...currentSheet,
          data: sortedData,
        },
      },
      modified: true,
    });
  };

  const handleWorksheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFile({
      ...file,
      currentWorksheet: e.target.value,
    });
  };

  const filteredData = searchTerm
    ? sheetData.filter((row, idx) => {
        if (idx === 0) return true; // Always include headers
        return row.some((cell) =>
          String(cell || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      })
    : sheetData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mr-2">
            {file.name}
          </h2>
          <select
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={file.currentWorksheet}
            name="sheetSelection"
            onChange={handleWorksheetChange}
          >
            {Object.keys(file.sheets).map((sheetName) => (
              <option key={sheetName} value={sheetName}>
                {sheetName}
              </option>
            ))}
          </select>
          {file.modified && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
              Modified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="tableSearch"
              placeholder="Search table..."
              className="pl-9 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            onClick={() => setShowInfo(!showInfo)}
            title="Information"
          >
            <Info className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <select
              id="exportFormat"
              className="bg-gray-100 border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              defaultValue="xlsx"
            >
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
              onClick={() => {
                const format = document.getElementById(
                  "exportFormat"
                ) as HTMLSelectElement;
                exportFile(
                  file,
                  format.value as "xlsx" | "csv" | "json" | "pdf"
                );
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 text-sm text-blue-800 dark:text-blue-200 border-b border-blue-200 dark:border-blue-800 flex-shrink-0">
          <p>
            <strong>Double-click</strong> any cell to edit its content.
          </p>
          <p>
            <strong>Click column headers</strong> to sort the table in ascending
            order.
          </p>
          <p>
            All changes are saved automatically and can be downloaded using the
            Download button.
          </p>
          <p>
            <strong>Select worksheet</strong> from the dropdown to view/edit
            other sheets.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-auto min-h-0">
        <div className="h-full overflow-x-auto overflow-y-auto">
          <table className="w-full h-full table-fixed border-collapse">
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex === 0
                      ? "bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 h-12"
                      : "bg-white dark:bg-gray-800 h-10"
                  }
                >
                  {row.map((cell, colIndex) => (
                    <TableCell
                      key={`${rowIndex}-${colIndex}`}
                      value={cell}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      isHeader={rowIndex === 0}
                      sortColumn={sortColumn}
                      updateCell={updateCell}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-600 flex items-center justify-between flex-shrink-0">
        <span>
          {filteredData.length - 1} rows{" "}
          {searchTerm && `(filtered from ${sheetData.length - 1})`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const newData = sheetData.map((r) => [...r, ""]);
              updateFile({
                ...file,
                sheets: {
                  ...file.sheets,
                  [file.currentWorksheet]: {
                    ...currentSheet,
                    data: newData,
                  },
                },
                modified: true,
              });
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Column
          </button>
          <button
            onClick={() => {
              let newRow;
              if (sheetData.length > 1) {
                const lastRow = sheetData[sheetData.length - 1];
                newRow = lastRow.map(cell => {
                  if (typeof cell === 'number') {
                    return 0;
                  } else if (cell instanceof Date) {
                    return null;
                  } else if (cell === null) {
                    return null;
                  } else {
                    return "";
                  }
                });
              } else {
                newRow = Array(sheetData[0].length).fill("");
              }
              const newData = [...sheetData, newRow];
              updateFile({
                ...file,
                sheets: {
                  ...file.sheets,
                  [file.currentWorksheet]: {
                    ...currentSheet,
                    data: newData,
                  },
                },
                modified: true,
              });
            }}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;
