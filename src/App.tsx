import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom';
import FileUploader from "./components/FileUploader";
import FileList from "./components/FileList";
import ExcelViewer from "./components/ExcelViewer";
import NoFilesPlaceholder from "./components/NoFilesPlaceholder";
import { ExcelFile } from "./types";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
const MergeWizard = React.lazy(() => import("./components/MergeWizard"));

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

  useEffect(() => {
    const state = { files, activeFileId, selectedFiles };
    sessionStorage.setItem("excel_app_state", JSON.stringify(state));
  }, [files, activeFileId, selectedFiles]);

  const handleMergeSelection = (fileIds: string[], fileName: string) => {
    // Verify headers match across all selected files
    const allFiles = files.filter(f => fileIds.includes(f.id));
    const firstHeaders = allFiles[0]?.sheets[allFiles[0].currentWorksheet].headers;
    
    const allMatch = allFiles.every(file => 
      JSON.stringify(file.sheets[file.currentWorksheet].headers) === JSON.stringify(firstHeaders)
    );

    if (!allMatch) {
      alert('Selected files have mismatched headers. Please select files with identical column structures.');
      setSelectedFiles([]);
      return;
    }

    // Validate at least 2 files selected
    if (fileIds.length < 2) return;
    
    // Clear any previous selections
    setSelectedFiles([]);
    // Create merged file
    const mergedFile: ExcelFile = {
      id: Date.now().toString(),
      name: fileName,
      sheets: {
        'Sheet 1': {
          headers: firstHeaders,
          data: allFiles.flatMap((file, index) => 
            index === 0 
              ? file.sheets[file.currentWorksheet].data // Include headers from first file
              : file.sheets[file.currentWorksheet].data.slice(1) // Skip headers from other files
          )
        }
      },
      currentWorksheet: 'Sheet 1',
      modified: true
    };

    // Add merged file and make it active
    setFiles(prev => [...prev, mergedFile]);
    setActiveFileId(mergedFile.id);
    setSelectedFiles([]);
    alert(`Successfully merged ${fileIds.length} files into ${fileName}`);
  };

  const handleFileUpload = (file: ExcelFile) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    setActiveFileId(file.id);
  };

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles((prevFiles) => {
      const remainingFiles = prevFiles.filter((file) => file.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(
          remainingFiles.length > 0 ? remainingFiles[0].id : null
        );
      }
      return remainingFiles;
    });
  };

  const updateFile = (updatedFile: ExcelFile) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.id === updatedFile.id ? updatedFile : file))
    );
  };

  const activeFile = files.find((file) => file.id === activeFileId);

  // Dark mode hook
  const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(() => {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    return [darkMode, setDarkMode] as const;
  };

  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <Routes>
      <Route
        path="/merge"
        element={
          <React.Suspense fallback={<div>Loading...</div>}>
            <MergeWizard files={files} onMerge={handleMergeSelection} />
          </React.Suspense>
        }
      />
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header darkMode={darkMode} setDarkMode={setDarkMode} />
            <main className="w-full max-w-9/10 mx-auto px-4 py-8 sm:px-6 md:px-8 dark:text-gray-100 flex-grow">
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Upload Excel Files
                  </h2>
                  <FileUploader onFileUpload={handleFileUpload} />
                </div>

                {files.length > 0 && (
                  <FileList
                    files={files}
                    activeFileId={activeFileId || ""}
                    selectedFiles={selectedFiles}
                    onSelectFile={handleFileSelect}
                    onRemoveFile={handleFileRemove}
                    onSelectMerge={handleMergeSelection}
                  />
                )}

                {activeFile ? (
                  <ExcelViewer file={activeFile} updateFile={updateFile} />
                ) : (
                  <NoFilesPlaceholder />
                )}
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
