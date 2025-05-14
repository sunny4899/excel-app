export interface ExcelFile {
  id: string;
  name: string;
  data: Array<Array<any>>;
  headers: Array<string>;
  modified: boolean;
}

export interface TableCellProps {
  value: any;
  rowIndex: number;
  colIndex: number;
  isHeader: boolean;
  sortColumn: (colIndex: number) => void;
  updateCell: (rowIndex: number, colIndex: number, value: any) => void;
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