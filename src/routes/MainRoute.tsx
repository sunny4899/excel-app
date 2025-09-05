import { FC } from "react";
import MainLayout from "../components/MainLayout";
import FileUploader from "../components/FileUploader";
import FileList from "../components/FileList";
import ExcelViewer from "../components/ExcelViewer";
import NoFilesPlaceholder from "../components/NoFilesPlaceholder";
import TableCreator from "../components/TableCreator";
import { ExcelFile } from "../types";
import SuspenseWrapper from "../components/shared/SuspenseWrapper";

interface MainRouteProps {
  files: ExcelFile[];
  activeFileId: string | null;
  isCreating: boolean;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  handleFileUpload: (file: ExcelFile) => void;
  handleFileSelect: (fileId: string) => void;
  handleFileRemove: (fileId: string) => void;
  setIsCreating: (value: boolean) => void;
  onSaveNewFile: (newFile: ExcelFile) => void;
  updateFile: (updatedFile: ExcelFile) => void;
}

const MainRoute: FC<MainRouteProps> = ({
  files,
  activeFileId,
  isCreating,
  darkMode,
  setDarkMode,
  handleFileUpload,
  handleFileSelect,
  handleFileRemove,
  setIsCreating,
  onSaveNewFile,
  updateFile,
}) => {
  const activeFile = files.find((file) => file.id === activeFileId);

  return (
    <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="grid grid-cols-1 gap-8">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Upload Excel Files
          </h2>
          <SuspenseWrapper>
            <FileUploader onFileUpload={handleFileUpload} />
          </SuspenseWrapper>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Table
          </button>
        </div>

        {/* Table Creation */}
        {isCreating && (
          <SuspenseWrapper>
            <TableCreator
              darkMode={darkMode}
              onSave={onSaveNewFile}
              onCancel={() => setIsCreating(false)}
            />
          </SuspenseWrapper>
        )}

        {/* File List */}
        {files.length > 0 && (
          <SuspenseWrapper>
            <FileList
              files={files}
              activeFileId={activeFileId ?? ""}
              onSelectFile={handleFileSelect}
              onRemoveFile={handleFileRemove}
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
    </MainLayout>
  );
};

export default MainRoute;
