import { useState } from 'react';
import { FileListProps } from '../types';
import { FileText, X, Download } from 'lucide-react';
import { downloadExcelFile } from '../utils/excel';

const FileList: React.FC<FileListProps> = ({ 
  files, 
  activeFileId, 
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
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Uploaded Files</h2>
      <div className="flex flex-wrap gap-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={`
              relative flex items-center p-3 rounded-lg cursor-pointer 
              border transition-all duration-200 hover:shadow-md
              ${file.id === activeFileId 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-blue-300'
              }
            `}
            onClick={() => onSelectFile(file.id)}
            onMouseEnter={() => setHoveredFileId(file.id)}
            onMouseLeave={() => setHoveredFileId(null)}
          >
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {file.data.length - 1} rows
                {file.modified && (
                  <span className="ml-2 text-amber-600 font-medium">Modified</span>
                )}
              </p>
            </div>

            {(hoveredFileId === file.id || file.id === activeFileId) && (
              <div className="flex ml-3 gap-1">
                <button
                  className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                  onClick={(e) => handleDownload(e, file.id)}
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"
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