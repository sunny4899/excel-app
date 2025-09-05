import { FC } from 'react';
import MainLayout from '../components/MainLayout';
import MergeWizard from '../components/MergeWizard';
import SuspenseWrapper from '../components/shared/SuspenseWrapper';
import { ExcelFile } from '../types';

interface MergeRouteProps {
  files: ExcelFile[];
  onMerge: (fileIds: string[], fileName: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

const MergeRoute: FC<MergeRouteProps> = ({ files, onMerge, darkMode, setDarkMode }) => (
  <MainLayout darkMode={darkMode} setDarkMode={setDarkMode}>
    <SuspenseWrapper>
      <MergeWizard files={files} onMerge={onMerge} />
    </SuspenseWrapper>
  </MainLayout>
);

export default MergeRoute;
