export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t mt-auto dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 md:px-8">
        <p className="text-center text-gray-500 dark:text-gray-300 text-sm">
          Excel File Manager © {new Date().getFullYear()}. Built with{" "}
          <a
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            React
          </a>{" "}
          and{" "}
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Tailwind CSS
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
