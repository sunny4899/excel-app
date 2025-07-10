export interface ExcelFile {
  id: string;
  name: string;
  sheets: { [key: string]: { headers: string[], data: (string | number | Date | null)[][] } };
  currentWorksheet: string;
  modified: boolean;
}

export type SheetData = {
  headers: string[];
  data: (string | number | Date | null)[][];
};

export interface TableCellProps {
  value: string | number | Date | null;
  rowIndex: number;
  colIndex: number;
  isHeader: boolean;
  sortColumn: (colIndex: number) => void;
  updateCell: (
    rowIndex: number,
    colIndex: number,
    value: string | number | Date | null
  ) => void;
}

export interface ExcelViewerProps {
  file: ExcelFile;
  updateFile: (updatedFile: ExcelFile) => void;
}

export interface FileListProps {
  files: ExcelFile[];
  activeFileId: string;
  selectedFiles: string[];
  onSelectFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
  onSelectMerge: (fileIds: string[], fileName: string) => void;
}

export interface FileUploaderProps {
  onFileUpload: (file: ExcelFile) => void;
}
