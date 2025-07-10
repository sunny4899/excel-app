import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileListProps } from '../types';
import { FileText, X, Download } from 'lucide-react';
import { downloadExcelFile } from '../utils/excel';

const FileList: React.FC<FileListProps> = ({ 
  files, 
  activeFileId, 
  selectedFiles,
  onSelectFile, 
  onRemoveFile
}) => {
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);

  if (files.length === 0) {
    return null;
  }

  const handleDownload = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    const file = files.find(f => f.id === fileId);
    if (file) {
      downloadExcelFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    onRemoveFile(fileId);
  };

  return (
      <div className="mb-6 dark:text-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Uploaded Files</h2>
        <Link 
          to="/merge" 
          state={{ selectedIds: selectedFiles }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-sm font-medium transition-colors"
        >
          Merge Files
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={`
              relative flex items-center p-3 rounded-lg cursor-pointer 
              border transition-all duration-200 hover:shadow-md
              ${selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
              ${file.id === activeFileId 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' 
                : 'border-gray-200 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-400'
              }
            `}
            onClick={() => onSelectFile(file.id)}
            onMouseEnter={() => setHoveredFileId(file.id)}
            onMouseLeave={() => setHoveredFileId(null)}
          >
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {file.sheets[file.currentWorksheet].data.length - 1} rows
                {file.modified && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">Modified</span>
                )}
              </p>
            </div>

            {(hoveredFileId === file.id || file.id === activeFileId) && (
              <div className="flex ml-3 gap-1">
                <button
                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  onClick={(e) => handleDownload(e, file.id)}
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                  onClick={(e) => handleRemove(e, file.id)}
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
