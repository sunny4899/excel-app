import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ExcelFile } from "./types";
import useDarkMode from "./hooks/useDarkMode";
import MainRoute from "./routes/MainRoute";
import MergeRoute from "./routes/MergeRoute";

function App() {
  const [files, setFiles] = useState<ExcelFile[]>(() => {
    const stored = localStorage.getItem("excel_app_state");
    return stored ? JSON.parse(stored).files : [];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    const stored = localStorage.getItem("excel_app_state");
    return stored ? JSON.parse(stored).activeFileId : null;
  });

  const [isCreating, setIsCreating] = useState(false);

  const [darkMode, setDarkMode] = useDarkMode();

  useEffect(() => {
    const state = {
      files,
      activeFileId,
      isCreating,
    };
    localStorage.setItem("excel_app_state", JSON.stringify(state));
  }, [files, activeFileId, isCreating]);

  const handleFileUpload = (file: ExcelFile) => {
    setFiles((prev: ExcelFile[]) => [...prev, file]);
    setActiveFileId(file.id);
  };

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles(files.filter((f: ExcelFile) => f.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(
        files.length > 1
          ? files.find((f: ExcelFile) => f.id !== fileId)?.id || null
          : null
      );
    }
  };

  const handleMergeSelection = (fileIds: string[], fileName: string) => {
    const allFiles = files.filter((f: ExcelFile) => fileIds.includes(f.id));
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
  };

  const updateFile = (updatedFile: ExcelFile) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.id === updatedFile.id ? updatedFile : file))
    );
  };

  return (
    <Routes>
      <Route
        path="/merge"
        element={
          <MergeRoute
            files={files}
            onMerge={handleMergeSelection}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        }
      />
      <Route
        path="/"
        element={
          <MainRoute
            files={files}
            activeFileId={activeFileId}
            isCreating={isCreating}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            handleFileUpload={handleFileUpload}
            handleFileSelect={handleFileSelect}
            handleFileRemove={handleFileRemove}
            setIsCreating={setIsCreating}
            onSaveNewFile={(newFile) => {
              setFiles([...files, newFile]);
              setActiveFileId(newFile.id);
              setIsCreating(false);
            }}
            updateFile={updateFile}
          />
        }
      />
    </Routes>
  );
}

export default App;
