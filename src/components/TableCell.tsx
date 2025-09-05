import { useState, useRef, useEffect } from "react";
import { TableCellProps } from "../types";
import { ArrowUpDown } from "lucide-react";

const TableCell: React.FC<TableCellProps> = ({
  value,
  rowIndex,
  colIndex,
  isHeader,
  sortColumn,
  deleteColumn,
  updateCell,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState<string>(value?.toString() ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setCellValue(value?.toString() ?? "");
  }, [value]);

  const handleDoubleClick = () => {
    // allow editing both data cells and header cells via double-click
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (cellValue !== (value?.toString() ?? "")) {
      let newValue = cellValue.trim() === "" ? null : cellValue;

      // Try to parse as date if it matches date format
      if (newValue && newValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(newValue);
        if (!isNaN(date.getTime())) {
          newValue = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }
      }

      updateCell(rowIndex, colIndex, newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      let newValue = cellValue.trim() === "" ? null : cellValue;

      // Try to parse as date if it matches date format
      if (newValue && newValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(newValue);
        if (!isNaN(date.getTime())) {
          newValue = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }
      }

      updateCell(rowIndex, colIndex, newValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setCellValue(value?.toString() ?? "");
    }
  };

  if (isHeader) {
    // show input when editing header, otherwise show header UI
    if (isEditing) {
      return (
        <th className="px-4 py-3 bg-gray-100 dark:bg-gray-700 font-semibold text-sm text-left text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 sticky top-0 transition-colors">
          <div>
            <input
              ref={inputRef}
              type="text"
              className="w-full border-0 focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-200 rounded text-sm font-semibold"
              value={cellValue}
              onChange={(e) => setCellValue(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (cellValue !== (value?.toString() ?? "")) {
                  // do not allow null header values; use empty string instead
                  updateCell(rowIndex, colIndex, cellValue ?? "");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  updateCell(rowIndex, colIndex, cellValue ?? "");
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                  setCellValue(value?.toString() ?? "");
                }
              }}
            />
          </div>
        </th>
      );
    }

    const displayValue = value?.toString() ?? "";

    return (
      <th className="px-4 py-3 bg-gray-100 dark:bg-gray-700 font-semibold text-sm text-left text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 sticky top-0 transition-colors">
        <div className="flex items-center justify-between">
          <button
            className="flex-1 text-left cursor-pointer text-sm"
            onClick={() => {
              // If header empty, open editor on click
              if (!displayValue) {
                setIsEditing(true);
              }
            }}
            onDoubleClick={handleDoubleClick}
            title={displayValue ? "Edit header" : "Add header"}
            aria-label={
              displayValue
                ? `Edit ${displayValue} header`
                : `Add header for column ${colIndex + 1}`
            }
          >
            {displayValue ? (
              displayValue
            ) : (
              <span className="text-gray-400 italic">Add header</span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => sortColumn(colIndex)}
              title="Sort column"
              aria-label={`Sort by ${displayValue || 'this column'}`}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            {deleteColumn && (
              <button
                onClick={() => deleteColumn(colIndex)}
                title="Delete column"
                className="text-red-500 hover:text-red-700 ml-2 px-1 py-0.5 rounded"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </th>
    );
  }

  if (isEditing) {
    return (
      <td className="px-4 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-gray-800">
        <input
          ref={inputRef}
          type="text"
          className="w-full  border-0  focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-200 rounded"
          value={cellValue}
          onChange={(e) => setCellValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={
            typeof value === "string" &&
            value.match(/^[A-Za-z]{3} \d{1,2}, \d{4}$/)
              ? "YYYY-MM-DD"
              : ""
          }
        />
      </td>
    );
  }

  return (
    <td
      className="px-4 py-3 border-b dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      onDoubleClick={handleDoubleClick}
    >
      {value?.toString() ?? ""}
    </td>
  );
};

export default TableCell;
