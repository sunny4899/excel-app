import React from "react";
import { FileSpreadsheet } from "lucide-react";

const NoFilesPlaceholder: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center">
      <FileSpreadsheet className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
        No Files Uploaded
      </h3>
      <p className="text-gray-500 dark:text-gray-300 max-w-md mb-4">
        Upload Excel files to view, edit, and manage your spreadsheet data.
        Changes will be saved automatically.
      </p>
    </div>
  );
};

export default NoFilesPlaceholder;
