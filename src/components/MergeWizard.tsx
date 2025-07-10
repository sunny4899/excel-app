import { useState } from 'react';
import { ExcelFile } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, Merge } from 'lucide-react';

interface MergeWizardProps {
  files: ExcelFile[];
  onMerge: (selectedIds: string[], fileName: string) => void;
}

const MergeWizard: React.FC<MergeWizardProps> = ({ files, onMerge }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<string[]>(location.state?.selectedIds || []);
  const [fileName, setFileName] = useState('');

  const handleMerge = () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 files to merge');
      return;
    }
    if (!fileName.trim()) {
      alert('Please enter a name for the merged file');
      return;
    }
    onMerge(selectedFiles, fileName);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft className="h-5 w-5" />
          Back to Files
        </Link>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Merge className="h-6 w-6" /> Merge Files
        </h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Merged File Name
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter merged file name"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedFiles.includes(file.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => {
                setSelectedFiles(prev =>
                  prev.includes(file.id)
                    ? prev.filter(id => id !== file.id)
                    : [...prev, file.id]
                );
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    {file.sheets[file.currentWorksheet].headers.length} columns,{' '}
                    {file.sheets[file.currentWorksheet].data.length} rows
                  </p>
                </div>
                {selectedFiles.includes(file.id) && <Check className="h-5 w-5 text-blue-500" />}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleMerge}
          disabled={selectedFiles.length < 2}
          className={`mt-6 px-6 py-3 text-white rounded-lg font-medium transition-all ${
            selectedFiles.length >= 2
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Merge {selectedFiles.length} Files
        </button>
      </div>
    </div>
  );
};

export default MergeWizard;
