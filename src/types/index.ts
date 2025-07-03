export interface ExcelFile {
  id: string;
  name: string;
  sheets: { [key: string]: { headers: string[], data: unknown[][] } };
  currentWorksheet: string;
  modified: boolean;
}

export type SheetData = {
  headers: string[];
  data: unknown[][];
};

export interface TableCellProps {
  value: unknown;
  rowIndex: number;
  colIndex: number;
  isHeader: boolean;
  sortColumn: (colIndex: number) => void;
  updateCell: (rowIndex: number, colIndex: number, value: unknown) => void;
}

export interface ExcelViewerProps {
  file: ExcelFile;
  updateFile: (updatedFile: ExcelFile) => void;
}

export interface FileListProps {
  files: ExcelFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
}

export interface FileUploaderProps {
  onFileUpload: (file: ExcelFile) => void;
}
