import { Link } from 'react-router-dom';

export default function TopBar({ title = 'Untitled Project' }) {
  return (
    <header className="h-[50px] flex items-center border-b border-border bg-surface px-8 shrink-0">
      <Link to="/" className="flex items-center gap-2.5 pr-8 text-white hover:opacity-90">
        <svg className="w-[18px] h-[18.75px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>
      <div className="flex items-center justify-center flex-1 text-lg font-normal text-white">
        {title}
      </div>
      <div className="w-20" />
    </header>
  );
}
