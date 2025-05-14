import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

const NoFilesPlaceholder: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
      <FileSpreadsheet className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Files Uploaded</h3>
      <p className="text-gray-500 max-w-md mb-4">
        Upload Excel files to view, edit, and manage your spreadsheet data. 
        Changes will be saved automatically.
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-gray-600">Upload multiple Excel files at once</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-gray-600">Edit cells by double-clicking</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-gray-600">Sort columns by clicking on headers</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-gray-600">Download your modified Excel files</span>
        </div>
      </div>
    </div>
  );
};

export default NoFilesPlaceholder;