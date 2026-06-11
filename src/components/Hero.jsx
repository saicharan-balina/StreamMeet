import { FiArrowRight, FiPlayCircle } from "react-icons/fi";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50"
    >
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-20 pt-14 sm:px-6 lg:flex-row lg:items-center lg:gap-14 lg:px-8 lg:pt-20">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-sky-200 bg-sky-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
            Built for students and teams
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Meet, Chat and Collaborate Online
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            StreamMeet is a video conferencing platform built with WebRTC and Socket.IO that
            allows users to create rooms, join meetings, chat in real time, and share screens.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Create Meeting
              <FiArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#join"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <FiPlayCircle className="h-4 w-4" />
              Join Meeting
            </a>
          </div>
        </div>

        <div className="w-full max-w-lg self-center rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-sm">
          <div className="rounded-xl bg-slate-900 p-4 text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Live Room Preview</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-24 rounded-lg bg-sky-500/80" />
              <div className="h-24 rounded-lg bg-emerald-500/80" />
              <div className="h-24 rounded-lg bg-amber-500/80" />
              <div className="h-24 rounded-lg bg-slate-700" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
              <span>Room: SM-204</span>
              <span>Chat Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
