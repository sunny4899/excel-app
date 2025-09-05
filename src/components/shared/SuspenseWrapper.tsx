import { ReactNode, Suspense } from 'react';

const SuspenseWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="text-center p-4">Loading component...</div>}>
    {children}
  </Suspense>
);

export default SuspenseWrapper;
