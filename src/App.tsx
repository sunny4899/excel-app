import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ExcelFile } from "./types";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";

const FileUploader = React.lazy(() => import("./components/FileUploader"));
const FileList = React.lazy(() => import("./components/FileList"));
const ExcelViewer = React.lazy(() => import("./components/ExcelViewer"));
const NoFilesPlaceholder = React.lazy(
  () => import("./components/NoFilesPlaceholder")
);
const MergeWizard = React.lazy(() => import("./components/MergeWizard"));

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return [darkMode, setDarkMode] as const;
}

function App() {
  const [files, setFiles] = useState<ExcelFile[]>(() => {
    const stored = sessionStorage.getItem("excel_app_state");
    return stored ? JSON.parse(stored).files : [];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    const stored = sessionStorage.getItem("excel_app_state");
    return stored ? JSON.parse(stored).activeFileId : null;
  });

  const [selectedFiles, setSelectedFiles] = useState<string[]>(() => {
    const stored = sessionStorage.getItem("excel_app_state");
    return stored ? JSON.parse(stored).selectedFiles : [];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newTableHeaders, setNewTableHeaders] = useState<string[]>([
    "Column 1",
  ]);
  const [newTableData, setNewTableData] = useState<string[][]>([[""]]);
  const [newTableName, setNewTableName] = useState<string>("");

  const [darkMode, setDarkMode] = useDarkMode();

  useEffect(() => {
    const state = { files, activeFileId, selectedFiles };
    sessionStorage.setItem("excel_app_state", JSON.stringify(state));
  }, [files, activeFileId, selectedFiles]);

  const handleFileUpload = (file: ExcelFile) => {
    setFiles((prev) => [...prev, file]);
    setActiveFileId(file.id);
  };

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles(files.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(
        files.length > 1 ? files.find((f) => f.id !== fileId)?.id || null : null
      );
    }
  };

const handleMergeSelection = (fileIds: string[], fileName: string) => {
  const allFiles = files.filter((f) => fileIds.includes(f.id));
  const firstHeaders =
    allFiles[0]?.sheets[allFiles[0].currentWorksheet].headers;

  const allMatch = allFiles.every(
    (file) =>
      JSON.stringify(file.sheets[file.currentWorksheet].headers) ===
      JSON.stringify(firstHeaders)
  );

  if (!allMatch) {
    alert(
      "Selected files have mismatched headers. Please select files with identical column structures."
    );
    setSelectedFiles([]);
    return;
  }

  if (fileIds.length < 2) return;

  const mergedRows = [
    firstHeaders, // include headers as first row
    ...allFiles.flatMap(
      (file) => file.sheets[file.currentWorksheet].data.slice(1) // skip headers from each file
    ),
  ];

  const mergedFile: ExcelFile = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // unique ID
    name: fileName,
    sheets: {
      "Sheet 1": {
        headers: firstHeaders,
        data: mergedRows,
      },
    },
    currentWorksheet: "Sheet 1",
    modified: false,
  };

  setFiles((prev) => [
    ...prev.filter((f) => f.id !== mergedFile.id),
    mergedFile,
  ]);
  setActiveFileId(mergedFile.id);
  setSelectedFiles([]);
};


  const updateFile = (updatedFile: ExcelFile) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.id === updatedFile.id ? updatedFile : file))
    );
  };

  const activeFile = files.find((file) => file.id === activeFileId);

  const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <React.Suspense
      fallback={<div className="text-center p-4">Loading component...</div>}
    >
      {children}
    </React.Suspense>
  );

  return (
    <Routes>
      {/* Merge Route */}
      <Route
        path="/merge"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header darkMode={darkMode} setDarkMode={setDarkMode} />
            <SuspenseWrapper>
              <MergeWizard files={files} onMerge={handleMergeSelection} />
            </SuspenseWrapper>
            <Footer />
          </div>
        }
      />
      {/* Main Route */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header darkMode={darkMode} setDarkMode={setDarkMode} />
            <main className="w-full max-w-[90%] mx-auto px-4 py-8 sm:px-6 md:px-8 dark:text-gray-100 flex-grow">
              <div className="grid grid-cols-1 gap-8">
                {/* Upload Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold mb-4">
                    Upload Excel Files
                  </h2>
                  <SuspenseWrapper>
                    <FileUploader onFileUpload={handleFileUpload} />
                  </SuspenseWrapper>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    + Create New Table
                  </button>
                </div>

                {/* Table Creation */}
                {isCreating && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="new-table-name"
                          className="text-sm font-medium"
                        >
                          Table Name
                        </label>
                        <input
                          id="new-table-name"
                          type="text"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                          placeholder="Enter table name"
                          className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setNewTableHeaders(["Column 1"]);
                          setNewTableData([[""]]);
                          setNewTableName("");
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                    {/* Table UI */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            {newTableHeaders.map((header, index) => (
                              <th
                                key={index}
                                className="p-2 border bg-gray-100 dark:bg-gray-700"
                              >
                                <input
                                  type="text"
                                  value={header}
                                  onChange={(e) => {
                                    const newHeaders = [...newTableHeaders];
                                    newHeaders[index] = e.target.value;
                                    setNewTableHeaders(newHeaders);
                                  }}
                                  className="bg-transparent w-full text-center"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {newTableData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} className="p-2 border">
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) => {
                                      const newData = [...newTableData];
                                      newData[rowIndex][colIndex] =
                                        e.target.value;
                                      setNewTableData(newData);
                                    }}
                                    className="w-full bg-transparent text-center"
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
                          Add Row
                        </button>
                        <button
                          onClick={() => {
                            const newColumnName = `Column ${
                              newTableHeaders.length + 1
                            }`;
                            setNewTableHeaders([
                              ...newTableHeaders,
                              newColumnName,
                            ]);
                            setNewTableData(
                              newTableData.map((row) => [...row, ""])
                            );
                          }}
                          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                          Add Column
                        </button>
                        <button
                          onClick={() => {
                            const tableName = newTableName.trim()
                              ? newTableName
                              : `New Table ${files.length + 1}`;
                            const newFile: ExcelFile = {
                              id: Date.now().toString(),
                              name: tableName,
                              sheets: {
                                "Sheet 1": {
                                  headers: newTableHeaders,
                                  data: [newTableHeaders, ...newTableData], // include headers as first row
                                },
                              },
                              currentWorksheet: "Sheet 1",
                              modified: false,
                            };
                            setFiles([...files, newFile]);
                            setActiveFileId(newFile.id);
                            setIsCreating(false);
                            setNewTableHeaders(["Column 1"]);
                            setNewTableData([[""]]);
                            setNewTableName("");
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Create Table
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* File List */}
                {files.length > 0 && (
                  <SuspenseWrapper>
                    <FileList
                      files={files}
                      activeFileId={activeFileId ?? ""}
                      selectedFiles={selectedFiles}
                      onSelectFile={handleFileSelect}
                      onRemoveFile={handleFileRemove}
                      onSelectMerge={handleMergeSelection}
                    />
                  </SuspenseWrapper>
                )}

                {/* Excel Viewer / Placeholder */}
                {activeFile ? (
                  <SuspenseWrapper>
                    <ExcelViewer file={activeFile} updateFile={updateFile} />
                  </SuspenseWrapper>
                ) : !isCreating ? (
                  <SuspenseWrapper>
                    <NoFilesPlaceholder />
                  </SuspenseWrapper>
                ) : null}
              </div>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
