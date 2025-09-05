import React, { useState, useEffect } from "react";
import { ExcelFile } from "../types";

type TableCreatorProps = {
  darkMode: boolean;
  onSave: (file: ExcelFile) => void;
  onCancel: () => void;
};

const TableCreator: React.FC<TableCreatorProps> = ({
  darkMode,
  onSave,
  onCancel,
}) => {
  const [newTableName, setNewTableName] = useState("");
  const [newTableHeaders, setNewTableHeaders] = useState(["Column 1"]);
  const [newTableData, setNewTableData] = useState([[""]]);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("table_creator_draft");
      if (stored) {
        const draft = JSON.parse(stored);
        if (draft.newTableName !== undefined)
          setNewTableName(draft.newTableName);
        if (Array.isArray(draft.newTableHeaders))
          setNewTableHeaders(draft.newTableHeaders);
        if (Array.isArray(draft.newTableData))
          setNewTableData(draft.newTableData);
      }
    } catch (err) {
      console.warn("Failed to load TableCreator draft from localStorage:", err);
    }
  }, []);

  // Save draft to localStorage whenever form state changes
  useEffect(() => {
    try {
      const draft = { newTableName, newTableHeaders, newTableData };
      localStorage.setItem("table_creator_draft", JSON.stringify(draft));
    } catch (err) {
      console.warn("Failed to save TableCreator draft to localStorage:", err);
    }
  }, [newTableName, newTableHeaders, newTableData]);

  const handleCreateTable = () => {
    const tableName = newTableName.trim() || `New Table ${Date.now()}`;
    const newFile: ExcelFile = {
      id: Date.now().toString(),
      name: tableName,
      sheets: {
        "Sheet 1": {
          headers: newTableHeaders,
          data: [newTableHeaders, ...newTableData],
        },
      },
      currentWorksheet: "Sheet 1",
      modified: false,
    };
    onSave(newFile);

    // Persist new file to localStorage so page reload keeps the new table
    try {
      const stored = localStorage.getItem("excel_app_state");
      const state = stored
        ? JSON.parse(stored)
        : { files: [], activeFileId: null, isCreating: false };
      state.files = [...(state.files || []), newFile];
      state.activeFileId = newFile.id;
      localStorage.setItem("excel_app_state", JSON.stringify(state));
    } catch (err) {
      // don't block UI on storage errors
      console.warn("Failed to persist new table to localStorage:", err);
    }
    handleReset();
  };

  const handleReset = () => {
    setNewTableName("");
    setNewTableHeaders(["Column 1"]);
    setNewTableData([[""]]);
    onCancel();
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="new-table-name"
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              Table Name
            </label>
            <input
              id="new-table-name"
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Enter table name"
              className="border rounded px-2 py-1 text-sm text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              autoFocus
            />
          </div>
          <button
            onClick={handleReset}
            className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100"
          >
            Cancel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {newTableHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="p-2 border bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  >
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => {
                        const newHeaders = [...newTableHeaders];
                        newHeaders[index] = e.target.value;
                        setNewTableHeaders(newHeaders);
                      }}
                      className="bg-transparent w-full text-center text-gray-900 dark:text-gray-100"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {newTableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-2 border border-gray-200 dark:border-gray-600"
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => {
                          const newData = [...newTableData];
                          newData[rowIndex][colIndex] = e.target.value;
                          setNewTableData(newData);
                        }}
                        className="w-full bg-transparent text-center text-gray-900 dark:text-gray-100"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() =>
                setNewTableData([
                  ...newTableData,
                  newTableHeaders.map(() => ""),
                ])
              }
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Row
            </button>
            <button
              onClick={() => {
                const newColumnName = `Column ${newTableHeaders.length + 1}`;
                setNewTableHeaders([...newTableHeaders, newColumnName]);
                setNewTableData(newTableData.map((row) => [...row, ""]));
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              + Column
            </button>
            <button
              onClick={handleCreateTable}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCreator;
