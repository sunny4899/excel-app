import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface MainLayoutProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  children: ReactNode;
}

const MainLayout = ({ darkMode, setDarkMode, children }: MainLayoutProps) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <Header darkMode={darkMode} setDarkMode={setDarkMode} />
    {/* Main area constrained to 90% of viewport width and centered; header/footer remain full width */}
    <main className="flex-grow w-[90vw] mx-auto mt-6 mb-8">{children}</main>
    <Footer />
  </div>
);

export default MainLayout;
