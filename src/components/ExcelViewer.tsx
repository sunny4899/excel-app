import { useState } from 'react';
import { ExcelFile, ExcelViewerProps } from '../types';
import TableCell from './TableCell';
import { sortTableData, downloadExcelFile } from '../utils/excel';
import { Search, Download, Info } from 'lucide-react';

const ExcelViewer: React.FC<ExcelViewerProps> = ({ file, updateFile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  if (!file) return null;

  // Use the current worksheet's data
  const currentSheet = file.sheets[file.currentWorksheet];
  const sheetData = currentSheet.data;

  const updateCell = (rowIndex: number, colIndex: number, value: any) => {
    const newData = [...sheetData];
    newData[rowIndex][colIndex] = value;

    updateFile({
      ...file,
      sheets: {
        ...file.sheets,
        [file.currentWorksheet]: {
          ...currentSheet,
          data: newData
        }
      },
      modified: true
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
          data: sortedData
        }
      },
      modified: true
    });
  };

  const handleWorksheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFile({
      ...file,
      currentWorksheet: e.target.value
    });
  };

  const filteredData = searchTerm
    ? sheetData.filter((row, idx) => {
        if (idx === 0) return true; // Always include headers
        return row.some(cell =>
          String(cell || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : sheetData;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 mr-2">{file.name}</h2>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={file.currentWorksheet}
            onChange={handleWorksheetChange}
          >
            {Object.keys(file.sheets).map(sheetName => (
              <option key={sheetName} value={sheetName}>
                {sheetName}
              </option>
            ))}
          </select>
          {file.modified && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
              Modified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search table..."
              className="pl-9 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            onClick={() => setShowInfo(!showInfo)}
            title="Information"
          >
            <Info className="h-5 w-5" />
          </button>
          <button
            className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            onClick={() => downloadExcelFile(file)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="bg-blue-50 p-4 text-sm text-blue-800 border-b border-blue-200">
          <p><strong>Double-click</strong> any cell to edit its content.</p>
          <p><strong>Click column headers</strong> to sort the table in ascending order.</p>
          <p>All changes are saved automatically and can be downloaded using the Download button.</p>
          <p><strong>Select worksheet</strong> from the dropdown to view/edit other sheets.</p>
        </div>
      )}

      <div className="overflow-x-auto max-h-[70vh]">
        <table className="min-w-full table-auto">
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-100' : ''}>
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

      <div className="p-3 bg-gray-50 text-sm text-gray-500 border-t">
        {filteredData.length - 1} rows {searchTerm && `(filtered from ${sheetData.length - 1})`}
      </div>
    </div>
  );
};

export default ExcelViewer;
