import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUploaderProps } from '../types';
import { parseExcelFile } from '../utils/excel';
import { FileUp } from 'lucide-react';

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const excelFiles = acceptedFiles.filter(file => 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      );
      
      if (excelFiles.length === 0) {
        alert('Please upload only Excel files (.xlsx or .xls)');
        return;
      }
      
      try {
        for (const file of excelFiles) {
          const parsedFile = await parseExcelFile(file);
          onFileUpload(parsedFile);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Failed to parse Excel file. Please ensure it\'s a valid Excel file.');
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        dark:border-gray-600 dark:hover:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <FileUp className="h-12 w-12 text-blue-500" />
        <div>
          {isDragActive ? (
            <p className="text-blue-500 font-medium">Drop Excel files here...</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium mb-1">Drag & drop Excel files here</p>
              <p className="text-gray-500 text-sm">or click to browse files</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
