import { useState, useRef, useEffect } from 'react';
import { TableCellProps } from '../types';
import { ArrowUpDown } from 'lucide-react';

const TableCell: React.FC<TableCellProps> = ({ 
  value, 
  rowIndex, 
  colIndex, 
  isHeader, 
  sortColumn,
  updateCell 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState<string>(value?.toString() ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setCellValue(value?.toString() ?? '');
  }, [value]);
  
  const handleDoubleClick = () => {
    if (!isHeader) {
      setIsEditing(true);
    }
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    if (cellValue !== (value?.toString() ?? '')) {
      let newValue = cellValue.trim() === '' ? null : cellValue;
      
      // Try to parse as date if it matches date format
      if (newValue && newValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(newValue);
        if (!isNaN(date.getTime())) {
          newValue = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      }
      
      updateCell(rowIndex, colIndex, newValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      let newValue = cellValue.trim() === '' ? null : cellValue;
      
      // Try to parse as date if it matches date format
      if (newValue && newValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(newValue);
        if (!isNaN(date.getTime())) {
          newValue = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      }
      
      updateCell(rowIndex, colIndex, newValue);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCellValue(value?.toString() ?? '');
    }
  };
  
  if (isHeader) {
    return (
      <th 
        className="px-4 py-3 bg-gray-100 dark:bg-gray-700 font-semibold text-sm text-left text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 sticky top-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        onClick={() => sortColumn(colIndex)}
      >
        <div className="flex items-center justify-between">
          <span>{value?.toString() ?? ''}</span>
          <ArrowUpDown className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" />
        </div>
      </th>
    );
  }
  
  if (isEditing) {
    return (
      <td className="px-2 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-gray-800">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-gray-200 rounded"
          value={cellValue}
          onChange={(e) => setCellValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={typeof value === 'string' && value.match(/^[A-Za-z]{3} \d{1,2}, \d{4}$/) ? 'YYYY-MM-DD' : ''}
        />
      </td>
    );
  }
  
  return (
      <td 
      className="px-4 py-3 border-b dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      onDoubleClick={handleDoubleClick}
    >
      {value?.toString() ?? ''}
    </td>
  );
};

export default TableCell;
