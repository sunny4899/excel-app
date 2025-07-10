import { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import FileList from "./components/FileList";
import ExcelViewer from "./components/ExcelViewer";
import NoFilesPlaceholder from "./components/NoFilesPlaceholder";
import { ExcelFile } from "./types";
import { TableProperties } from "lucide-react";
import { Routes, Route, Link } from 'react-router-dom';
import MergeWizard from "./components/MergeWizard";

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

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <Routes>
      <Route path="/merge" element={
        <MergeWizard 
          files={files}
          onMerge={handleMergeSelection}
        />
      }/>

      <Route path="/" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="max-w-9/10 mx-auto px-4 py-4 sm:px-6 md:px-8 flex justify-between items-center">
              <div className="flex items-center">
                <TableProperties className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Table Manager
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Upload • View • Edit • Download • 
                  <Link to="/merge" className="text-blue-600 hover:text-blue-800 ml-1">
                    Merge Files
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="w-full max-w-9/10 mx-auto px-4 py-8 sm:px-6 md:px-8 dark:text-gray-100">
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

          <footer className="bg-white dark:bg-gray-800 border-t mt-12 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 md:px-8">
              <p className="text-center text-gray-500 dark:text-gray-300 text-sm">
                Excel File Manager © {new Date().getFullYear()}. Built with{" "}
                <a
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  React
                </a>{" "}
                and{" "}
                <a
                  href="https://tailwindcss.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Tailwind CSS
                </a>
                .
              </p>
            </div>
          </footer>
        </div>
      }/>
    </Routes>
  );
}

export default App;
