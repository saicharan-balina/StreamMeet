import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function JoinMeeting() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-20">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center rounded-full border border-sky-200 bg-sky-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
              Join a meeting instantly
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Enter a room and start talking
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
              Use the same clean StreamMeet theme to join with a room ID, keep the layout simple,
              and get into the call quickly.
            </p>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
              <label className="text-sm font-semibold text-slate-700" htmlFor="roomId">
                Room ID or invite link
              </label>
              <input
                id="roomId"
                type="text"
                placeholder="Enter room code"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />

              <label className="text-sm font-semibold text-slate-700" htmlFor="displayName">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Join Meeting
                </button>
                <a
                  href="#home"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>

          <div className="self-center rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-sm">
            <div className="rounded-xl bg-slate-900 p-4 text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Join Preview
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="h-28 rounded-lg bg-sky-500/80" />
                <div className="h-28 rounded-lg bg-emerald-500/80" />
                <div className="h-28 rounded-lg bg-amber-500/80" />
                <div className="h-28 rounded-lg bg-slate-700" />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                <span>Secure room access</span>
                <span>Video ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}