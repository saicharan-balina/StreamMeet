import { useState } from "react";
import { FiMenu, FiVideo, FiX } from "react-icons/fi";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#footer" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="group flex items-center gap-2">
          <span className="rounded-xl bg-sky-600 p-2 text-white shadow-sm transition group-hover:bg-sky-700">
            <FiVideo className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-slate-900">StreamMeet</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-sm font-medium text-slate-600 transition hover:text-sky-700"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#join"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Join Meeting
          </a>
          <button
            type="button"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Create Meeting
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle menu"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden"
        >
          {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a
                href="#join"
                className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Join Meeting
              </a>
              <button
                type="button"
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
