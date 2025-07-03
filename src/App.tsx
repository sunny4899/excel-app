import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';
import ExcelViewer from './components/ExcelViewer';
import NoFilesPlaceholder from './components/NoFilesPlaceholder';
import { ExcelFile } from './types';
import { TableProperties } from 'lucide-react';

function App() {
  const [files, setFiles] = useState<ExcelFile[]>(() => {
    const stored = sessionStorage.getItem('excel_app_state');
    return stored ? JSON.parse(stored).files : [];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    const stored = sessionStorage.getItem('excel_app_state');
    return stored ? JSON.parse(stored).activeFileId : null;
  });

  useEffect(() => {
    const state = { files, activeFileId };
    sessionStorage.setItem('excel_app_state', JSON.stringify(state));
  }, [files, activeFileId]);

  const handleFileUpload = (file: ExcelFile) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    setActiveFileId(file.id);
  };

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles((prevFiles) => {
      const remainingFiles = prevFiles.filter(file => file.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
      }
      return remainingFiles;
    });
  };

  const updateFile = (updatedFile: ExcelFile) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === updatedFile.id ? updatedFile : file
      )
    );
  };

  const activeFile = files.find((file) => file.id === activeFileId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 md:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <TableProperties className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-800">
              Excel Manager
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            Upload • View • Edit • Download
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Upload Excel Files
            </h2>
            <FileUploader onFileUpload={handleFileUpload} />
          </div>

          {files.length > 0 && (
            <FileList
              files={files}
              activeFileId={activeFileId || ""}
              onSelectFile={handleFileSelect}
              onRemoveFile={handleFileRemove}
            />
          )}

          {activeFile ? (
            <ExcelViewer file={activeFile} updateFile={updateFile} />
          ) : (
            <NoFilesPlaceholder />
          )}
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 md:px-8">
          <p className="text-center text-gray-500 text-sm">
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
  );
}

export default App;
