interface FooterProps {
  version: string;
}

export function Footer({ version }: FooterProps) {
  return (
    <footer className="w-full py-4 px-4 text-center text-xs text-gray-500 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>Made with ❤️ by lessthanthree</span>
        <span className="hidden sm:inline">•</span>
        <span>v{version}</span>
        <span className="hidden sm:inline">•</span>
        <a
          href="https://github.com/ljhurst/sommething"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-wine-red transition-colors underline"
        >
          View source on GitHub
        </a>
      </div>
    </footer>
  );
}
