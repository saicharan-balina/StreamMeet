import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">StreamMeet</h3>
          <p className="mt-2 text-sm text-slate-600">
            A student-built video conferencing app using React, WebRTC, and Socket.IO.
          </p>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <a
            href="#"
            aria-label="GitHub"
            className="rounded-lg border border-slate-300 p-2 transition hover:border-slate-400 hover:bg-white"
          >
            <FiGithub className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            className="rounded-lg border border-slate-300 p-2 transition hover:border-slate-400 hover:bg-white"
          >
            <FiLinkedin className="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="Email"
            className="rounded-lg border border-slate-300 p-2 transition hover:border-slate-400 hover:bg-white"
          >
            <FiMail className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} StreamMeet. Built for learning and collaboration.
        </p>
      </div>
    </footer>
  );
}
